# EcoFleet AI — Production Implementation Plan

**Codebase:** `c:\Users\Mohit\OneDrive\wastechakra`  
**Generated from:** Full source audit of all 20 key files + investigation-report.md  
**Build commands:** `cd backend && pip install -r requirements.txt && uvicorn app.main:app` | `cd frontend && npm ci && npm run build`  
**Test command:** `cd backend && pytest backend/tests/ -v` (after tests are created)

> **Key findings from code scan before planning:**  
> - `requirements.txt` already has `python-jose[cryptography]>=3.3.0` and `passlib[bcrypt]>=1.7.4` — items confirmed present; plan items below verify they're correct and add any missing packages.  
> - `db/models.py` already has a `Truck` ORM model (id, truck_id, registration_number, driver_name, driver_phone, capacity_kg, zone, is_active, created_at, updated_at) — item 12 is already partially done; item 14 just needs the seeding and port.  
> - `cvrp_solver.py`: `_calculate_route` hardcodes `5000` but the outer `optimize_routes` immediately overwrites it — the fix is still needed inside `_calculate_route` for correctness.  
> - `AuthContext.jsx` stores `data.user` from login response (a `UserResponse` object). The `UserResponse` Pydantic schema includes `role`. JWT decoding for expiry check is the missing piece.  
> - All 5 routers (`nodes`, `forecast`, `routing`, `fleet`, `analytics`) have zero auth dependencies — confirmed in code.

---

## Phase 1 — Critical Fixes

---

- [ ] 1. **Verify and fix `requirements.txt`**  
  Confirm `python-jose[cryptography]>=3.3.0`, `passlib[bcrypt]>=1.7.4`, `httpx>=0.27.0`, `pytest>=8.0.0`, and `pytest-asyncio>=0.23.0` are all present with correct extras syntax. The current file has these but double-check the exact specifier strings match and add `slowapi>=0.1.9` if missing (it is currently in requirements — confirm).  
  **File:** `backend/requirements.txt`  
  **What to change:** Audit each line; update any specifier that is missing the `[extras]` bracket. Specifically confirm `passlib[bcrypt]` not bare `passlib`. Also confirm `httpx` is listed — it is currently present.  
  **Edge case:** `pyjwt[crypto]` and `python-jose[cryptography]` are both present; that's intentional (security.py imports from `jose` directly, no fallback). Keep both.  
  **Verify:** `cd backend && pip install -r requirements.txt --dry-run` — should resolve without errors.

---

- [ ] 2. **Add role-based auth dependencies to all 5 API routers**  
  Add `Depends(get_current_user_token)` or `Depends(require_role(...))` to each endpoint in the five unprotected routers. Import `get_current_user_token` and `require_role` from `app.core.security` in each file.

  **Exact per-router rules:**

  **`backend/app/api/routes/nodes.py`:**
  - Import: `from app.core.security import get_current_user_token, require_role, TokenData`
  - `GET /` (list_nodes) → `Depends(get_current_user_token)` (any authenticated user)
  - `GET /{node_id}` → `Depends(get_current_user_token)` (any authenticated user)
  - `POST /` (create_node) → `Depends(require_role("fleet_manager", "admin"))`
  - `PUT /{node_id}` (update_node) → `Depends(require_role("fleet_manager", "admin"))`
  - `DELETE /{node_id}` (delete_node) → `Depends(require_role("fleet_manager", "admin"))`
  - `POST /{node_id}/collect` → `Depends(get_current_user_token)` (drivers + managers + admin)
  - `POST /{node_id}/report` → **PUBLIC** — no auth dependency (citizen-facing)

  **`backend/app/api/routes/forecast.py`:**
  - Import: `from app.core.security import require_role`
  - `POST /` → `Depends(require_role("fleet_manager", "admin"))`
  - `GET /daily` → `Depends(require_role("fleet_manager", "admin"))`
  - `GET /weather` (new, added in Phase 3) → `Depends(get_current_user_token)` — leave a placeholder comment for now

  **`backend/app/api/routes/routing.py`:**
  - Import: `from app.core.security import get_current_user_token, require_role, TokenData`
  - `POST /optimize` → `Depends(require_role("fleet_manager", "admin"))`
  - `GET /today` → `Depends(require_role("fleet_manager", "admin"))`
  - `POST /dispatch` → `Depends(require_role("fleet_manager", "admin"))`
  - `GET /history` → `Depends(require_role("fleet_manager", "admin"))`
  - `POST /stop/status` → `Depends(require_role("driver", "fleet_manager", "admin"))`

  **`backend/app/api/routes/fleet.py`:**
  - Import: `from app.core.security import get_current_user_token, require_role, TokenData`
  - `GET /` → `Depends(require_role("fleet_manager", "admin", "driver"))`
  - `POST /` → `Depends(require_role("fleet_manager", "admin"))`
  - `PATCH /{truck_id}` → `Depends(require_role("fleet_manager", "admin"))`
  - `DELETE /{truck_id}` → `Depends(require_role("fleet_manager", "admin"))`

  **`backend/app/api/routes/analytics.py`:**
  - Import: `from app.core.security import require_role`
  - `GET /summary` → `Depends(require_role("fleet_manager", "admin"))`

  **Note on role naming:** The backend `auth.py` and `models.py` use `"admin"`, `"manager"`, and `"driver"` as role strings (see `User.role` column default and `require_role("admin", "manager")` in `list_users`). The plan specifies `"fleet_manager"` in the task brief — use `"manager"` to match the existing DB role strings already seeded. Rationale: `manager@ecofleet.in` will be seeded with role `"manager"` (not `"fleet_manager"`), and changing the role name only in guards would silently break access. Use `"manager"` everywhere role-based guards reference fleet_manager.

  **Implementation pattern** — add the dependency as a function argument (not router-level `dependencies=[]`) so `TokenData` is accessible if needed:
  ```python
  @router.get("/")
  async def list_nodes(
      zone: Optional[str] = Query(None),
      db: AsyncSession = Depends(get_db),
      _token: TokenData = Depends(get_current_user_token),
  ):
  ```
  Or for role checks:
  ```python
  @router.post("/")
  async def create_node(
      body: CollectionNodeCreate,
      db: AsyncSession = Depends(get_db),
      _token: TokenData = Depends(require_role("manager", "admin")),
  ):
  ```

  **Verify:** Start the backend with `cd backend && uvicorn app.main:app --reload`; then `curl http://localhost:8000/api/nodes/` must return `401 Unauthorized`. `curl http://localhost:8000/api/nodes/NODE-001/report -X POST -H "Content-Type: application/json" -d "{...}"` must succeed (200) without a token.

---

- [ ] 3. **Create `LoginPage.jsx`**  
  Create a full login page with dark/emerald theme matching the app's sidebar palette (`#090d16` background, `#22c55e` accent). Must use `AuthContext.login()` (not a raw fetch) and show demo credentials.

  **File:** `frontend/src/pages/LoginPage.jsx`  
  **What to build:**
  - Full-screen centered card on dark background (`#090d16`)
  - EcoFleet logo (Leaf icon + text) at top
  - Email and password inputs
  - Login button that calls `const result = await login(email, password)` — on success, navigate to `/`; on failure, show inline error message
  - A "Demo Credentials" section below the form with three chips:
    - Admin: `admin@ecofleet.in` / `EcoFleet@2026`
    - Fleet Manager: `manager@ecofleet.in` / `Fleet@2026`
    - Driver: `driver1@ecofleet.in` / `Driver@2026`
  - Each demo chip should be clickable and auto-fill the email/password inputs
  - Loading state: disable button and show spinner text while `isLoading` is true
  - Import `useNavigate` from `react-router-dom` and `useAuth` from `../../context/AuthContext`
  - If already authenticated, redirect to `/` immediately (check `isAuthenticated` in useEffect)

  **Styling:** Inline styles consistent with the rest of the app (no CSS modules, no Tailwind — the project uses inline style objects throughout). Dark card with emerald border, white text inputs.

  **Verify:** `cd frontend && npm run build` — build must complete without errors.

---

- [ ] 4. **Create `ProtectedRoute.jsx`**  
  A wrapper component that checks auth state and optional role before rendering children.

  **File:** `frontend/src/components/common/ProtectedRoute.jsx`  
  **What to build:**
  ```jsx
  // Props: children, allowedRoles (optional array of strings)
  // If isLoading: show full-screen spinner (prevent flash of login page during localStorage restore)
  // If not isAuthenticated: <Navigate to="/login" replace />
  // If allowedRoles provided and user.role not in allowedRoles: <Navigate to="/unauthorized" replace />
  // Otherwise: render children
  ```
  - Import `useAuth` from `../../context/AuthContext`
  - Import `Navigate` from `react-router-dom`
  - The loading check is critical: `AuthContext` sets `isLoading=true` on mount while restoring from localStorage. Without this check, every page refresh will flash the login page for a frame.

  **Verify:** `cd frontend && npm run build` — no errors.

---

- [ ] 5. **Create `UnauthorizedPage.jsx`**  
  A simple 403-style page shown when a user is authenticated but lacks the required role.

  **File:** `frontend/src/pages/UnauthorizedPage.jsx`  
  **What to build:**
  - Centered card with a lock/shield icon (use `ShieldCheck` or `Lock` from lucide-react)
  - "Access Restricted" heading
  - "Your account role (`{user.role}`) does not have permission to view this page."
  - A "Go Back" button (`useNavigate(-1)`) and a "Dashboard" button (`navigate('/')`)
  - Consistent white-card styling with the rest of the app

  **Verify:** `cd frontend && npm run build` — no errors.

---

- [ ] 6. **Update `App.jsx` — add /login route and wrap all protected routes**  
  Wire up the new pages and gate all private routes behind `ProtectedRoute`.

  **File:** `frontend/src/App.jsx`  
  **What to change:**
  - Add imports: `LoginPage`, `ProtectedRoute`, `UnauthorizedPage`, `Navigate`
  - Add `/login` route (public, no wrapper): `<Route path="/login" element={<LoginPage />} />`
  - Add `/unauthorized` route (public): `<Route path="/unauthorized" element={<UnauthorizedPage />} />`
  - Wrap all existing routes except `/login`, `/unauthorized`, and `/report` in `<ProtectedRoute>`:
    ```jsx
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/routes" element={<ProtectedRoute><RouteMap /></ProtectedRoute>} />
    <Route path="/forecast" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
    <Route path="/fleet" element={<ProtectedRoute><FleetPage /></ProtectedRoute>} />
    <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver', 'admin']}><DriverPage /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><AnalyticsPage /></ProtectedRoute>} />
    ```
  - `/report` stays unwrapped (citizen-facing public route)
  - Add a catch-all redirect: `<Route path="*" element={<Navigate to="/" replace />} />`
  - The sidebar nav in `App.jsx` renders even on the login page if it's inside the wrapper div — move the sidebar/main layout inside a conditional: if current path is `/login` or `/unauthorized`, render only the route outlet with no sidebar. Use `useLocation` to detect this. Alternative (simpler): move the sidebar render inside a `ProtectedRoute`-aware layout component or simply check `isAuthenticated` from `useAuth` before rendering the sidebar.

  **Edge case — sidebar on login:** The current structure renders `<aside>` (sidebar) unconditionally. On the `/login` route, the sidebar should not appear. Solution: import `useLocation` and conditionally render sidebar only when `location.pathname !== '/login' && location.pathname !== '/unauthorized'`. Wrap the entire sidebar+main block check inside a `useAuth` check or location check at the top of App.

  **Verify:** `cd frontend && npm run build` — no errors. Then `npm run preview` and navigate to `http://localhost:4173` — should redirect to `/login`.

---

- [ ] 7. **Update `AuthContext.jsx` — JWT decode for role + token expiry check**  
  The login flow already stores `data.user` (a `UserResponse` object from backend, which includes `role`). The gap is: (a) the JWT `exp` claim is never checked on localStorage restore, so an expired token stays active until the first API call fails; (b) `user.name` is used in `Navbar` but the `UserResponse` schema field is `full_name` not `name`.

  **File:** `frontend/src/context/AuthContext.jsx`  
  **What to change:**

  1. Add `isTokenExpired(token)` helper at module level:
     ```js
     function isTokenExpired(token) {
       try {
         const payload = JSON.parse(atob(token.split('.')[1]));
         return payload.exp * 1000 < Date.now();
       } catch {
         return true; // treat malformed tokens as expired
       }
     }
     ```

  2. In the `useEffect` localStorage restore block, add expiry check:
     ```js
     if (storedToken && storedUser) {
       if (isTokenExpired(storedToken)) {
         localStorage.removeItem(TOKEN_KEY);
         localStorage.removeItem(USER_KEY);
       } else {
         const parsedUser = JSON.parse(storedUser);
         setToken(storedToken);
         setUser(parsedUser);
         setIsAuthenticated(true);
       }
     }
     ```

  3. In the `login()` callback, after getting `userData = data.user`, decode the JWT to extract role as a safety net (in case `data.user` role differs):
     ```js
     // data.user already has role from UserResponse — use it directly
     // but normalise the name field: backend sends full_name, UI reads name
     const userData = {
       ...data.user,
       name: data.user.full_name || data.user.name || email.split('@')[0],
     };
     ```

  4. Expose `isTokenExpired` in the context value so `ProtectedRoute` can use it if needed (optional — the localStorage restore handles it on page load).

  **Why:** `Navbar.jsx` reads `user?.name` but `UserResponse` has `full_name`. Without this fix, initials in the navbar will always be `"U"` because `name` is undefined.

  **Verify:** `cd frontend && npm run build` — no errors.

---

- [ ] 8. **Add axios 401/403 interceptors in `api.js`**  
  Silent failures on expired tokens confuse users. Add a response interceptor that redirects to `/login` on 401 and to `/unauthorized` on 403.

  **File:** `frontend/src/services/api.js`  
  **What to change:**
  Add after the request interceptor:
  ```js
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('ecofleet_token');
        localStorage.removeItem('ecofleet_user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        window.location.href = '/unauthorized';
      }
      return Promise.reject(error);
    }
  );
  ```
  **Note:** Using `window.location.href` instead of React Router's `navigate` is intentional here because `api.js` is not a React component and doesn't have router context. This is the standard pattern for axios interceptors outside React.

  **Verify:** `cd frontend && npm run build` — no errors.

---

- [ ] 9. **Fix heuristic forecast confidence — replace `random.uniform` with deterministic formula**  
  The `_heuristic_forecast` function uses `random.uniform(0.75, 0.90)` for confidence, producing different values on every call for the same input. Replace with a formula derived from the existing `seed` hash.

  **File:** `backend/app/ml/forecaster.py`  
  **What to change:**
  Find the line:
  ```python
  confidence = round(random.uniform(0.75, 0.90), 3)
  ```
  Replace with:
  ```python
  confidence = round(0.75 + (seed % 1000) / 1000 * 0.15, 3)
  ```
  Also remove the `import random` statement at the top of the file since it will no longer be used (verify no other usage first — there is none in this file).

  **Why this formula:** `seed = hash(node_id + str(date)) % 1000` gives a value 0–999. Dividing by 1000 maps it to [0, 1). Multiplying by 0.15 gives a range of [0, 0.15). Adding 0.75 gives [0.75, 0.90) — the same range as the original `random.uniform` but deterministic per (node, date) pair. Identical to the original intent.

  **Verify:** `cd backend && python -c "from app.ml.forecaster import _heuristic_forecast; from datetime import date; r1 = _heuristic_forecast({'node_id':'N1','capacity_kg':500}, date(2026,10,1)); r2 = _heuristic_forecast({'node_id':'N1','capacity_kg':500}, date(2026,10,1)); assert r1[1] == r2[1], 'Confidence not deterministic'"` — must pass without AssertionError.

---

- [ ] 10. **Fix `load_utilization_pct` inside `_calculate_route` in `cvrp_solver.py`**  
  The `_calculate_route` function hardcodes `5000` as the capacity denominator. Although `optimize_routes` correctly overwrites this afterward, the internal value is wrong and misleading. Fix it at the source.

  **File:** `backend/app/routing/cvrp_solver.py`  
  **What to change:**
  In `_calculate_route`, add `truck_capacity_kg: int = 5000` as a parameter:
  ```python
  def _calculate_route(
      stops: List[dict],
      depot_lat: float,
      depot_lon: float,
      depot_name: str,
      truck_id: str,
      driver_name: Optional[str],
      truck_capacity_kg: int = 5000,   # ADD THIS
  ) -> dict:
  ```
  Replace the hardcoded line:
  ```python
  "load_utilization_pct": round(total_waste / 5000 * 100, 1),  # default 5t capacity
  ```
  With:
  ```python
  "load_utilization_pct": round(total_waste / truck_capacity_kg * 100, 1),
  ```
  Update the call site in `optimize_routes`:
  ```python
  route = _calculate_route(
      stop_nodes, depot.lat, depot.lon, depot.name, truck_id, driver,
      truck_capacity_kg=truck_capacity_kg,   # ADD THIS
  )
  ```
  Remove the now-redundant overwrite line that follows:
  ```python
  # DELETE THIS LINE (it's now correctly set inside _calculate_route):
  route["load_utilization_pct"] = round(route["total_waste_kg"] / truck_capacity_kg * 100, 1)
  ```

  **Verify:** `cd backend && python -c "from app.routing.cvrp_solver import optimize_routes; r = optimize_routes([{'node_id':'N1','node_name':'Test','latitude':28.55,'longitude':77.25,'predicted_volume_kg':2000,'fill_percentage':60,'risk_level':'medium'}], num_trucks=1, truck_capacity_kg=3000); print(r['routes'][0]['load_utilization_pct'])"` — should print ~66.7 (2000/3000*100), not 40.0 (2000/5000*100).

---

- [ ] 11. **Fix DriverPage arrival times — use `stop.estimated_arrival` from API**  
  The DriverPage currently ignores the backend-computed `estimated_arrival` field and uses a hardcoded formula.

  **File:** `frontend/src/pages/DriverPage.jsx`  
  **What to change:**
  Find the line (inside the stop mapping):
  ```jsx
  <span>Est. Arrival: 0{8 + Math.floor(idx * 0.8)}:{idx % 2 === 0 ? '15' : '45'} AM</span>
  ```
  Replace with:
  ```jsx
  <span>Est. Arrival: {stop.estimated_arrival || `${String(8 + Math.floor(idx * 0.8)).padStart(2,'0')}:${idx % 2 === 0 ? '15' : '45'}`}</span>
  ```
  This uses the backend value when available and falls back to the formula if the field is missing (defensive).

  **Verify:** `cd frontend && npm run build` — no errors.

---

## Phase 2 — Data Persistence

---

- [ ] 12. **`Truck` ORM model — already present; skip creation, proceed to seeding**  
  The `db/models.py` already has a `Truck` model with all required fields (id, truck_id, registration_number, driver_name, driver_phone, capacity_kg, zone, is_active, created_at, updated_at). No changes needed to `models.py` for the model itself.  
  **File:** `backend/app/db/models.py`  
  **Verify:** File already contains `class Truck(Base)` — confirm by reading. No action needed.

---

- [ ] 13. **Seed demo users and 5 initial trucks in `database.py`**  
  Add seeding for `manager@ecofleet.in`, `driver1@ecofleet.in`, and `citizen@ecofleet.in` demo users, plus the 5 trucks from `fleet.py`'s `_TRUCKS` list into the `Truck` table.

  **File:** `backend/app/core/database.py`  
  **What to change** (inside `init_db()`, after the existing admin user seed block):

  Add demo user seeding block:
  ```python
  # 3. Seed demo users (manager, driver, citizen) if not already present
  DEMO_USERS = [
      {"email": "manager@ecofleet.in", "password": "Fleet@2026",   "full_name": "Fleet Manager",  "role": "manager"},
      {"email": "driver1@ecofleet.in",  "password": "Driver@2026",  "full_name": "Ramesh Kumar",    "role": "driver"},
      {"email": "citizen@ecofleet.in",  "password": "Citizen@2026", "full_name": "Delhi Citizen",   "role": "citizen"},
  ]
  for demo in DEMO_USERS:
      stmt = select(db_models.User).where(db_models.User.email == demo["email"])
      res = await session.execute(stmt)
      if not res.scalar_one_or_none():
          session.add(db_models.User(
              email=demo["email"],
              hashed_password=get_password_hash(demo["password"]),
              full_name=demo["full_name"],
              role=demo["role"],
              is_active=True,
          ))
  ```

  Add truck seeding block:
  ```python
  # 4. Seed initial fleet trucks if not already present
  INITIAL_TRUCKS = [
      {"truck_id": "TRUCK-01", "registration_number": "DL-1C-0001", "driver_name": "Ramesh Kumar",  "driver_phone": "+91-9811001001", "capacity_kg": 5000, "zone": "South Delhi Zone 3", "is_active": True},
      {"truck_id": "TRUCK-02", "registration_number": "DL-1C-0002", "driver_name": "Suresh Yadav",  "driver_phone": "+91-9811001002", "capacity_kg": 5000, "zone": "South Delhi Zone 3", "is_active": True},
      {"truck_id": "TRUCK-03", "registration_number": "DL-1C-0003", "driver_name": "Mohan Singh",   "driver_phone": "+91-9811001003", "capacity_kg": 4000, "zone": "South Delhi Zone 4", "is_active": True},
      {"truck_id": "TRUCK-04", "registration_number": "DL-1C-0004", "driver_name": "Vijay Sharma",  "driver_phone": "+91-9811001004", "capacity_kg": 5000, "zone": "South Delhi Zone 4", "is_active": False},
      {"truck_id": "TRUCK-05", "registration_number": "DL-1C-0005", "driver_name": "Arun Gupta",    "driver_phone": "+91-9811001005", "capacity_kg": 3000, "zone": "South Delhi Zone 3", "is_active": True},
  ]
  truck_stmt = select(db_models.Truck).limit(1)
  truck_res = await session.execute(truck_stmt)
  if not truck_res.scalar_one_or_none():
      for t in INITIAL_TRUCKS:
          session.add(db_models.Truck(**t))
      logger.info("Seeded %d trucks into database.", len(INITIAL_TRUCKS))
  ```

  **Important:** Add `db_models.Truck` to the import at the top of the seeding block (it's already imported via `from app.db import models as db_models` — verify the `Truck` class is in `db.models` — it is).

  **Verify:** Delete `ecofleet.db` if it exists, then `cd backend && python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"` — should log "Seeded 5 trucks" and "Seeded default superuser". Then `python -c "import asyncio, sqlalchemy; ..."` or simply start uvicorn and check logs.

---

- [ ] 14. **Port `fleet.py` to async SQLAlchemy DB with in-memory fallback**  
  Replace the `_TRUCKS` module-level list with DB queries. Keep the in-memory list as a fallback for when DB is unavailable (matches the pattern in `nodes.py` and `routing.py`).

  **File:** `backend/app/api/routes/fleet.py`  
  **What to change:**
  - Add imports: `from sqlalchemy.ext.asyncio import AsyncSession`, `from sqlalchemy import select, delete`, `from app.core.database import get_db`, `from app.db.models import Truck as TruckModel`
  - Keep `_TRUCKS` list in place as the in-memory fallback (it mirrors the seeded data)
  - Rewrite `fleet_status()` to query DB first, fall back to `_TRUCKS`:
    ```python
    @router.get("/", response_model=FleetStatus)
    async def fleet_status(db: AsyncSession = Depends(get_db), ...):
        try:
            stmt = select(TruckModel)
            res = await db.execute(stmt)
            db_trucks = res.scalars().all()
            if db_trucks:
                trucks = [Truck(
                    truck_id=t.truck_id,
                    registration_number=t.registration_number,
                    driver_name=t.driver_name,
                    driver_phone=t.driver_phone,
                    capacity_kg=t.capacity_kg,
                    zone=t.zone,
                    is_active=t.is_active,
                ) for t in db_trucks]
                active = sum(1 for t in trucks if t.is_active)
                return FleetStatus(total_trucks=len(trucks), active_trucks=active, trucks=trucks)
        except Exception as exc:
            logger.warning("DB unavailable for fleet: %s", exc)
        # Fallback
        trucks = [Truck(**t) for t in _TRUCKS]
        active = sum(1 for t in trucks if t.is_active)
        return FleetStatus(total_trucks=len(trucks), active_trucks=active, trucks=trucks)
    ```
  - Rewrite `add_truck()` to insert into DB, append to `_TRUCKS` as fallback
  - Rewrite `update_truck()` to update DB row, update `_TRUCKS` dict as fallback
  - Rewrite `delete_truck()` to delete from DB, remove from `_TRUCKS` as fallback
  - Add `logger = logging.getLogger(__name__)` at module level

  **Schema note:** The `Truck` Pydantic schema in `schemas.py` must have fields matching the ORM model. Check `schemas.py` for the `Truck` model — it has `truck_id`, `registration_number`, `driver_name`, `driver_phone`, `capacity_kg`, `zone`, `is_active`. This matches the ORM `Truck` model.

  **Verify:** Start backend with `uvicorn app.main:app --reload`, `curl http://localhost:8000/api/fleet/ -H "Authorization: Bearer <token>"` should return 5 trucks from DB.

---

- [ ] 15. **Implement real analytics in `analytics.py` with DB fallback**  
  Replace hardcoded mock data with actual queries against `WasteLog` and `RouteSession` tables.

  **File:** `backend/app/api/routes/analytics.py`  
  **What to change:**
  - Add imports: `from fastapi import Depends`, `from sqlalchemy.ext.asyncio import AsyncSession`, `from sqlalchemy import select, func, desc`, `from app.core.database import get_db`, `from app.db.models import WasteLog, RouteSession`
  - Rewrite `get_analytics_summary()` to accept `db: AsyncSession = Depends(get_db)`
  - Query logic:
    ```python
    # Total waste diverted = sum of actual_waste_kg from WasteLog
    total_waste = await session.scalar(select(func.sum(WasteLog.actual_waste_kg))) or 0.0
    
    # Fuel and CO2 saved = sum from RouteSession
    total_fuel = await session.scalar(select(func.sum(RouteSession.fuel_saved_liters))) or 0.0
    total_co2 = await session.scalar(select(func.sum(RouteSession.co2_saved_kg))) or 0.0
    
    # Overflow incidents = WasteLogs with fill_percentage == 100.0
    overflows = await session.scalar(
        select(func.count(WasteLog.id)).where(WasteLog.fill_percentage >= 100.0)
    ) or 0
    
    # Active collection points = count of distinct node_ids in WasteLog (or just 25 from nodes table)
    active_nodes = await session.scalar(select(func.count(CollectionNodeModel.id))) or 25
    ```
  - 7-day trend: query `RouteSession` for the last 7 days, grouped by `session_date`. If no DB data, fall back to current formula.
  - Zone breakdown: query `WasteLog` joined to `CollectionNodeModel` grouped by zone. If no DB data, fall back to hardcoded zones.
  - If `total_waste == 0` and `total_fuel == 0` (fresh DB with no collections), fall back entirely to the current mock data — this ensures the demo still looks good before any routes are dispatched.
  - SWM compliance rate: derive from `(1 - overflows / max(total_waste_logs, 1)) * 100` clamped to [0, 100], or fall back to 98.6 if DB empty.

  **Important:** Import `CollectionNodeModel` from `app.db.models` for the active nodes count.

  **Verify:** After seeding, start backend and `curl http://localhost:8000/api/analytics/summary -H "Authorization: Bearer <token>"` — should return data (mock data for fresh DB, real data after routes are dispatched).

---

- [ ] 16. **Implement `/routing/stop/status` DB persistence**  
  The endpoint currently returns a success response but never updates `TruckAssignment.stops_data` in the DB.

  **File:** `backend/app/api/routes/routing.py`  
  **What to change:**
  Rewrite `update_stop_status()` to actually mutate the DB:
  ```python
  @router.post("/stop/status", summary="Driver updates status of a route stop")
  async def update_stop_status(
      body: StopStatusUpdate,
      db: AsyncSession = Depends(get_db),
      _token: TokenData = Depends(require_role("driver", "fleet_manager", "admin")),
  ):
      now = datetime.now(timezone.utc)
      try:
          # Find the most recent TruckAssignment for this truck_id
          stmt = (
              select(TruckAssignment)
              .where(TruckAssignment.truck_id == body.truck_id)
              .order_by(desc(TruckAssignment.created_at))
              .limit(1)
          )
          res = await db.execute(stmt)
          assignment = res.scalar_one_or_none()
          if assignment and assignment.stops_data:
              stops = list(assignment.stops_data)  # copy JSON list
              for stop in stops:
                  if stop.get("stop_index") == body.stop_index:
                      stop["status"] = body.status
                      stop["collected_kg"] = body.collected_kg
                      stop["completed_at"] = now.isoformat()
                      break
              from sqlalchemy import update as sa_update
              await db.execute(
                  sa_update(TruckAssignment)
                  .where(TruckAssignment.id == assignment.id)
                  .values(stops_data=stops)
              )
              await db.commit()
      except Exception as exc:
          logger.warning("Could not persist stop status: %s", exc)
      
      return {
          "status": "updated",
          "truck_id": body.truck_id,
          "stop_index": body.stop_index,
          "stop_status": body.status,
          "collected_kg": body.collected_kg,
          "updated_at": now.isoformat(),
          "message": f"Stop {body.stop_index} marked as {body.status}.",
      }
  ```
  **Note:** SQLAlchemy JSON column mutation (replacing a list element) requires replacing the entire column value, not modifying in-place — `stops = list(assignment.stops_data)` creates a new list, mutations are tracked correctly on assignment via `sa_update`.

  **Verify:** Dispatch a route, then POST to `/api/routing/stop/status` with a valid truck_id and stop_index; verify the `stops_data` JSON in the DB was updated (check via SQLite browser or a follow-up query in a test).

---

## Phase 3 — Weather Integration

---

- [ ] 17. **Create `backend/app/core/weather.py` — async Open-Meteo integration**  
  Free, no API key required. Uses Open-Meteo's public API.

  **File:** `backend/app/core/weather.py`  
  **What to build:**
  ```python
  """
  Weather data fetcher using the free Open-Meteo API (no key required).
  Provides Delhi weather conditions for a given date.
  """
  import httpx
  import logging
  from datetime import date, datetime, timezone, timedelta
  from typing import Optional

  logger = logging.getLogger(__name__)

  # 1-hour in-memory cache: {date_str: (fetched_at, data)}
  _CACHE: dict = {}
  _CACHE_TTL_SECONDS = 3600

  # Delhi coordinates
  DELHI_LAT = 28.6139
  DELHI_LON = 77.2090

  # WMO weather code to human-readable condition and emoji
  WMO_CODE_MAP = {
      0:  {"condition": "Clear Sky",        "icon": "sunny",  "emoji": "☀️"},
      1:  {"condition": "Mainly Clear",      "icon": "sunny",  "emoji": "🌤"},
      2:  {"condition": "Partly Cloudy",     "icon": "cloudy", "emoji": "⛅"},
      3:  {"condition": "Overcast",          "icon": "cloudy", "emoji": "☁️"},
      45: {"condition": "Foggy",             "icon": "cloudy", "emoji": "🌫"},
      48: {"condition": "Icy Fog",           "icon": "cloudy", "emoji": "🌫"},
      51: {"condition": "Light Drizzle",     "icon": "rainy",  "emoji": "🌦"},
      61: {"condition": "Light Rain",        "icon": "rainy",  "emoji": "🌧"},
      63: {"condition": "Moderate Rain",     "icon": "rainy",  "emoji": "🌧"},
      65: {"condition": "Heavy Rain",        "icon": "rainy",  "emoji": "🌧"},
      80: {"condition": "Rain Showers",      "icon": "rainy",  "emoji": "🌦"},
      95: {"condition": "Thunderstorm",      "icon": "rainy",  "emoji": "⛈"},
      99: {"condition": "Heavy Thunderstorm","icon": "rainy",  "emoji": "⛈"},
  }

  async def get_delhi_weather(target_date: date) -> dict:
      """
      Fetch weather data for Delhi on target_date.
      Returns dict with: date, weather_code, condition, precipitation_mm, icon, emoji, source.
      Uses 1-hour in-memory cache to avoid redundant API calls.
      Falls back to default (clear sky) if API unreachable.
      """
      date_str = target_date.isoformat()
      
      # Check cache
      if date_str in _CACHE:
          fetched_at, cached_data = _CACHE[date_str]
          age = (datetime.now(timezone.utc) - fetched_at).total_seconds()
          if age < _CACHE_TTL_SECONDS:
              return cached_data
      
      try:
          url = (
              "https://api.open-meteo.com/v1/forecast"
              f"?latitude={DELHI_LAT}&longitude={DELHI_LON}"
              "&daily=weathercode,precipitation_sum"
              "&timezone=Asia%2FKolkata"
              f"&start_date={date_str}&end_date={date_str}"
          )
          async with httpx.AsyncClient(timeout=5.0) as client:
              response = await client.get(url)
              response.raise_for_status()
              data = response.json()
          
          daily = data.get("daily", {})
          codes = daily.get("weathercode", [0])
          precip = daily.get("precipitation_sum", [0.0])
          
          weather_code = int(codes[0]) if codes else 0
          precipitation_mm = float(precip[0]) if precip else 0.0
          
          meta = WMO_CODE_MAP.get(weather_code, WMO_CODE_MAP[0])
          result = {
              "date": date_str,
              "weather_code": weather_code,
              "condition": meta["condition"],
              "precipitation_mm": precipitation_mm,
              "icon": meta["icon"],
              "emoji": meta["emoji"],
              "source": "Open-Meteo (free, no API key)",
          }
          _CACHE[date_str] = (datetime.now(timezone.utc), result)
          return result
      
      except Exception as exc:
          logger.warning("Open-Meteo weather fetch failed for %s: %s", date_str, exc)
          # Return clear-sky fallback
          return {
              "date": date_str,
              "weather_code": 0,
              "condition": "Clear Sky (fallback)",
              "precipitation_mm": 0.0,
              "icon": "sunny",
              "emoji": "☀️",
              "source": "fallback",
          }
  ```

  **Verify:** `cd backend && python -c "import asyncio; from app.core.weather import get_delhi_weather; from datetime import date; r = asyncio.run(get_delhi_weather(date.today())); print(r)"` — should print weather dict with a real condition.

---

- [ ] 18. **Wire weather to `forecast.py` — auto-fetch + new weather endpoint**  
  Auto-fetch Delhi weather for the forecast date and add a `GET /api/forecast/weather` endpoint.

  **File:** `backend/app/api/routes/forecast.py`  
  **What to change:**

  1. Add import: `from app.core.weather import get_delhi_weather`
  2. Add new endpoint:
     ```python
     @router.get("/weather", summary="Get Delhi weather for a given date")
     async def get_weather(
         date: str = Query(..., description="ISO date YYYY-MM-DD"),
         _token: TokenData = Depends(get_current_user_token),
     ):
         try:
             d = date_module.fromisoformat(date)
         except ValueError:
             raise HTTPException(status_code=422, detail="date must be ISO 8601 (YYYY-MM-DD)")
         return await get_delhi_weather(d)
     ```
     (rename the `date` import to `date_module = date` to avoid shadowing the parameter name, or rename the param)
  3. In `daily_forecast()`, before running `batch_forecast`, auto-fetch weather if `weather_code` is the default 0 and the forecast date is today or future:
     ```python
     # Auto-fetch real weather if caller didn't override it
     if weather_code == 0:
         try:
             weather_data = await get_delhi_weather(d)
             weather_code = weather_data["weather_code"]
         except Exception:
             pass  # keep weather_code=0 (clear)
     ```
  4. Import `get_current_user_token, TokenData` from `app.core.security` for the weather endpoint auth.

  **Verify:** `curl "http://localhost:8000/api/forecast/weather?date=2026-10-15" -H "Authorization: Bearer <token>"` — returns JSON with `weather_code`, `condition`, `precipitation_mm`.

---

- [ ] 19. **Update `Navbar.jsx` — replace `Math.random()` weather with API call**  
  The `WeatherChip` component currently simulates weather on mount with Math.random. Replace it with a real fetch to the new `/api/forecast/weather?date=today` endpoint.

  **File:** `frontend/src/components/common/Navbar.jsx`  
  **What to change:**
  Rewrite `WeatherChip`:
  ```jsx
  function WeatherChip() {
    const [weather, setWeather] = useState({ condition: 'sunny', temp: null, emoji: '☀️' });

    useEffect(() => {
      const today = new Date().toISOString().split('T')[0];
      const token = localStorage.getItem('ecofleet_token');
      if (!token) return; // don't fetch if not logged in
      
      fetch(`/api/forecast/weather?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setWeather({
              condition: data.condition,
              icon: data.icon || 'sunny',
              temp: null,      // Open-Meteo daily endpoint doesn't return temperature
              emoji: data.emoji,
              precipitation_mm: data.precipitation_mm,
            });
          }
        })
        .catch(() => {}); // silent fail — keep default sunny chip
    }, []);

    const Icon = WEATHER_ICONS[weather.icon] || Sun;
    const label = weather.precipitation_mm > 0
      ? `${weather.precipitation_mm}mm`
      : weather.condition.split(' ')[0]; // first word: "Clear", "Rainy", etc.

    return (
      <div style={styles.weatherChip}>
        <Icon size={16} color="#10b981" />
        <span style={styles.weatherText}>{label}</span>
      </div>
    );
  }
  ```
  **Note on temperature:** The Open-Meteo `daily` endpoint doesn't return temperature by default. The label shows precipitation or the condition name. If temperature is desired, add `&daily=temperature_2m_max` to the weather.py URL and return `temperature_max` in the response — this is optional and noted as a nice-to-have.

  **Verify:** `cd frontend && npm run build` — no errors. In browser, the weather chip shows "Clear", "Rain", etc. instead of a random value.

---

## Phase 4 — CI, Tests, and Deployment

---

- [ ] 20. **Create `backend/tests/` with conftest, health, auth, forecast, and nodes tests**  
  The CI pipeline requires `backend/tests/` to exist and pass. Use `httpx.AsyncClient` with `pytest-asyncio`.

  **Files to create:**
  - `backend/tests/__init__.py` (empty)
  - `backend/tests/conftest.py`
  - `backend/tests/test_health.py`
  - `backend/tests/test_auth.py`
  - `backend/tests/test_forecast.py`
  - `backend/tests/test_nodes.py`

  **`conftest.py`:**
  ```python
  import pytest
  import pytest_asyncio
  from httpx import AsyncClient, ASGITransport
  from app.main import app
  import os

  # Force SQLite for tests
  os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
  os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-ci-only-32chars!!")

  @pytest_asyncio.fixture(scope="session")
  async def client():
      async with AsyncClient(
          transport=ASGITransport(app=app), base_url="http://test"
      ) as ac:
          yield ac

  @pytest_asyncio.fixture(scope="session")
  async def auth_headers(client):
      """Login as admin and return bearer headers."""
      resp = await client.post("/api/auth/login", json={
          "email": "admin@ecofleet.in",
          "password": "EcoFleet@2026",
      })
      assert resp.status_code == 200
      token = resp.json()["access_token"]
      return {"Authorization": f"Bearer {token}"}
  ```

  **`test_health.py`:**
  ```python
  import pytest

  @pytest.mark.asyncio
  async def test_health(client):
      resp = await client.get("/health")
      assert resp.status_code == 200
      data = resp.json()
      assert data["status"] == "ok"
      assert data["service"] == "ecofleet-backend"
      assert "environment" in data
  ```

  **`test_auth.py`:**
  ```python
  import pytest

  @pytest.mark.asyncio
  async def test_login_admin(client):
      resp = await client.post("/api/auth/login", json={
          "email": "admin@ecofleet.in", "password": "EcoFleet@2026"
      })
      assert resp.status_code == 200
      assert "access_token" in resp.json()

  @pytest.mark.asyncio
  async def test_login_wrong_password(client):
      resp = await client.post("/api/auth/login", json={
          "email": "admin@ecofleet.in", "password": "wrong"
      })
      assert resp.status_code == 401

  @pytest.mark.asyncio
  async def test_get_me(client, auth_headers):
      resp = await client.get("/api/auth/me", headers=auth_headers)
      assert resp.status_code == 200
      assert resp.json()["email"] == "admin@ecofleet.in"
      assert resp.json()["role"] == "admin"

  @pytest.mark.asyncio
  async def test_protected_route_no_token(client):
      """Nodes endpoint must return 401 without a token."""
      resp = await client.get("/api/nodes/")
      assert resp.status_code == 401
  ```

  **`test_forecast.py`:**
  ```python
  import pytest
  from datetime import date

  @pytest.mark.asyncio
  async def test_daily_forecast(client, auth_headers):
      resp = await client.get(
          f"/api/forecast/daily?forecast_date={date.today().isoformat()}",
          headers=auth_headers,
      )
      assert resp.status_code == 200
      data = resp.json()
      assert "forecasts" in data
      assert len(data["forecasts"]) > 0
      assert data["forecasts"][0]["confidence"] > 0

  @pytest.mark.asyncio
  async def test_forecast_unauthorized(client):
      resp = await client.get(f"/api/forecast/daily?forecast_date={date.today().isoformat()}")
      assert resp.status_code == 401
  ```

  **`test_nodes.py`:**
  ```python
  import pytest

  @pytest.mark.asyncio
  async def test_list_nodes_authenticated(client, auth_headers):
      resp = await client.get("/api/nodes/", headers=auth_headers)
      assert resp.status_code == 200
      assert resp.json()["total"] >= 25  # 25 seeded nodes

  @pytest.mark.asyncio
  async def test_citizen_report_public(client):
      """Citizen report endpoint must be accessible without auth."""
      resp = await client.post(
          "/api/nodes/NODE-001/report",
          json={
              "node_id": "NODE-001",
              "issue_type": "overflow",
              "reporter_name": "Test Citizen",
              "reporter_contact": "test@example.com",
              "estimated_overflow_kg": 100.0,
              "description": "Bin overflowing",
          },
      )
      assert resp.status_code == 200
      assert resp.json()["status"] == "received"
  ```

  **pytest.ini / pyproject.toml configuration:** Add `asyncio_mode = "auto"` so all async tests run without decorating every test with `@pytest.mark.asyncio`. Add a `pytest.ini` file:
  ```ini
  # backend/pytest.ini
  [pytest]
  asyncio_mode = auto
  testpaths = tests
  ```
  This removes the need for `@pytest.mark.asyncio` decorators on every test (optional but cleaner).

  **Verify:** `cd backend && pytest tests/ -v` — all tests must pass.

---

- [ ] 21. **Fix `ci.yml` — remove alembic step, use SQLite, point pytest correctly**  
  The CI currently fails on two steps: `alembic upgrade head` (no alembic config) and `pytest tests/` (directory didn't exist until item 20).

  **File:** `.github/workflows/ci.yml`  
  **What to change:**
  1. Remove the PostgreSQL service block from the `backend-test` job entirely. The tests will use SQLite (`sqlite+aiosqlite:///./test.db`) — no postgres service needed.
  2. Update the `env` block:
     ```yaml
     env:
       DATABASE_URL: sqlite+aiosqlite:///./test.db
       JWT_SECRET_KEY: test-secret-key-for-ci-only-32characters!!
       JWT_ALGORITHM: HS256
       ACCESS_TOKEN_EXPIRE_MINUTES: 480
       DEBUG: "true"
       FIRST_SUPERUSER_EMAIL: admin@ecofleet.in
       FIRST_SUPERUSER_PASSWORD: EcoFleet@2026
     ```
  3. Remove the `Run migrations` step (`alembic upgrade head`).
  4. Update the `Install dependencies` step — remove the redundant `pip install pytest pytest-asyncio pytest-cov httpx` since they're now in `requirements.txt`.
  5. Update the `Run pytest` step:
     ```yaml
     - name: Run pytest with coverage
       working-directory: backend
       run: |
         pytest tests/ \
           --cov=app \
           --cov-report=xml \
           --cov-report=term-missing \
           -v
     ```
  6. Keep the frontend and docker build jobs unchanged.

  **Ordering constraint:** Item 20 (create tests) must be done before this item is meaningful.

  **Verify:** Push to a branch and check GitHub Actions — the backend-test job should pass green.

---

- [ ] 22. **Create `railway.json` for Railway.app deployment**  
  Railway is a free-tier PaaS that supports Python + Node projects without Docker overhead for demos.

  **File:** `c:\Users\Mohit\OneDrive\wastechakra\railway.json`  
  ```json
  {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "DOCKERFILE",
      "dockerfilePath": "backend/Dockerfile"
    },
    "deploy": {
      "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
      "healthcheckPath": "/health",
      "healthcheckTimeout": 300,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  }
  ```

  **Verify:** File parses as valid JSON — `python -c "import json; json.load(open('railway.json'))"`.

---

- [ ] 23. **Create root `.env.example`**  
  Documents all required environment variables for anyone deploying the project.

  **File:** `c:\Users\Mohit\OneDrive\wastechakra\.env.example`  
  ```env
  # ─── Backend ───────────────────────────────────────────────
  # Database (PostgreSQL for production, SQLite for dev — auto-fallback)
  DATABASE_URL=postgresql+asyncpg://ecofleet:changeme@localhost:5432/ecofleet

  # JWT — MUST be a strong random secret in production (32+ chars)
  JWT_SECRET_KEY=change-me-to-a-strong-random-secret-key-at-least-32-chars
  JWT_ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=480

  # Default superuser created on first startup
  FIRST_SUPERUSER_EMAIL=admin@ecofleet.in
  FIRST_SUPERUSER_PASSWORD=EcoFleet@2026
  FIRST_SUPERUSER_FULL_NAME=EcoFleet Administrator

  # CORS — comma-separated list of allowed frontend origins
  CORS_ORIGINS=http://localhost:5173,http://localhost:80,https://your-frontend-domain.com

  # Debug mode (true in dev, false in production)
  DEBUG=false

  # ─── Frontend (Vite) ──────────────────────────────────────
  VITE_API_BASE_URL=http://localhost:8000
  VITE_APP_NAME=EcoFleet AI
  VITE_APP_VERSION=1.0.0
  ```

  **Verify:** File exists and is human-readable.

---

- [ ] 24. **Create `Procfile` for Heroku/Railway Procfile-based deployment**  
  **File:** `c:\Users\Mohit\OneDrive\wastechakra\Procfile`  
  ```
  web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
  ```

  **Verify:** File exists with the correct format.

---

- [ ] 25. **Fix CORS in `main.py` — explicit list, no wildcard fallback**  
  Current code: `allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["http://localhost:5173"]` — this is already an explicit list, not a `"*"` wildcard. However, the task calls for an explicit default list.

  **File:** `backend/app/main.py`  
  **What to change:**
  Replace the CORS middleware origins line with:
  ```python
  _cors_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
      "http://localhost:5173",
      "http://localhost:80",
      "http://localhost:3000",
  ]
  app.add_middleware(
      CORSMiddleware,
      allow_origins=_cors_origins,
      allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
  This is already nearly correct in the existing code; the change adds `http://localhost:80` and `http://localhost:3000` to the default list.

  **Verify:** `cd backend && python -c "from app.main import app; print('CORS OK')"` — no import errors.

---

- [ ] 26. **Fix `health` endpoint `environment` field in `main.py`**  
  The health endpoint returns a hardcoded `"production"` string. It already uses `settings.DEBUG` in the existing code — verify and confirm.

  **File:** `backend/app/main.py`  
  **Current code (already correct):**
  ```python
  "environment": "development" if settings.DEBUG else "production",
  ```
  This was already fixed in the current `main.py` (confirmed during code read). No change needed.  
  **Action:** Verify the line reads `settings.DEBUG` not a hardcoded string. If already correct, skip.

---

- [ ] 27. **Add FleetPage add/edit modal + inline status toggle (fleet_manager/admin only)**  
  The current `FleetPage.jsx` is read-only. Add add-truck modal, edit-truck modal, and an inline toggle for `is_active` status.

  **File:** `frontend/src/pages/FleetPage.jsx`  
  **What to build:**

  1. **State additions:**
     - `const [showModal, setShowModal] = useState(false)`
     - `const [editingTruck, setEditingTruck] = useState(null)` (null = add mode, truck object = edit mode)
     - `const [saving, setSaving] = useState(false)`
     - `const { user } = useAuth()` — to conditionally show controls

  2. **Role gate:** Only show "Add Truck" button and edit/delete controls when `user?.role === 'manager' || user?.role === 'admin'`.

  3. **Add Truck button** (top right of page, visible to manager/admin only):
     ```jsx
     {(user?.role === 'manager' || user?.role === 'admin') && (
       <button onClick={() => { setEditingTruck(null); setShowModal(true); }} style={styles.addBtn}>
         + Add Truck
       </button>
     )}
     ```

  4. **Inline status toggle** on each truck card (visible to manager/admin only):
     ```jsx
     {(user?.role === 'manager' || user?.role === 'admin') && (
       <button
         onClick={() => handleToggleStatus(truck)}
         style={{ ...styles.toggleBtn, color: truck.is_active ? '#dc2626' : '#16a34a' }}
       >
         {truck.is_active ? 'Set Maintenance' : 'Set Active'}
       </button>
     )}
     ```
     `handleToggleStatus` calls `updateTruck(truck.truck_id, { is_active: !truck.is_active })` then refreshes fleet.

  5. **Edit button** on each card:
     ```jsx
     <button onClick={() => { setEditingTruck(truck); setShowModal(true); }}>Edit</button>
     ```

  6. **Modal component** (inline, no external library):
     - Overlay (`position: fixed, inset: 0, background: rgba(0,0,0,0.5)`) with centered form card
     - Fields: truck_id (disabled on edit), registration_number, driver_name, driver_phone, capacity_kg, zone, is_active checkbox
     - Save button calls `createTruck(formData)` (add mode) or `updateTruck(truck_id, formData)` (edit mode)
     - On success: close modal, refresh fleet data
     - On error: show inline error message in modal

  7. Import `createTruck`, `updateTruck` from `../services/api.js` (already exported).
  8. Import `useAuth` from `../context/AuthContext`.
  9. Add `PlusCircle`, `Edit2` from `lucide-react` for button icons.

  **Verify:** `cd frontend && npm run build` — no errors. Login as manager, navigate to Fleet page — "Add Truck" button should be visible. Login as driver — button should not appear.

---

- [ ] 28. **Add `robots.txt` at `frontend/public/robots.txt`**  
  Prevents web crawlers from indexing the app and eliminates 404 log noise from browser prefetch.

  **File:** `frontend/public/robots.txt`  
  ```
  # EcoFleet AI — MCD Municipal Fleet Management System
  User-agent: *
  Disallow: /api/
  Disallow: /login
  Allow: /report

  Sitemap: https://your-domain.com/sitemap.xml
  ```

  **Verify:** `cd frontend && npm run build` — `dist/robots.txt` should appear in the build output.

---

## Implementation Ordering Summary

Items within a phase can be implemented in the listed sequence. Cross-phase dependencies:

- Item 2 (auth on routers) must come before item 20 (tests) — tests rely on auth being enforced.
- Item 3+4+5 (login page + protected routes) must come before item 6 (App.jsx wiring).
- Item 7 (AuthContext fix) must come before item 3 is fully testable in browser.
- Item 13 (seed trucks) must come before item 14 (port fleet.py to DB).
- Item 17 (weather.py) must come before item 18 (wire to forecast) and item 19 (Navbar).
- Item 20 (tests) must come before item 21 (CI fix) is meaningful.

Items that are independent (can be done in any order within their phase):
- Items 9, 10, 11 are independent of each other.
- Items 22, 23, 24, 25, 26, 28 are all independent infrastructure/config items.
- Item 27 (FleetPage UI) is independent of backend Phase 2 items but benefits from item 14 (DB-backed fleet).

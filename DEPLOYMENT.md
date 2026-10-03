# EcoFleet AI — Deployment Guide

## Architecture

| Layer | Platform | Cost |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Free tier |
| **Backend API** | [Railway.app](https://railway.app) | Free tier ($5 credit/month) |
| **PostgreSQL DB** | Railway PostgreSQL plugin | Free (included) |

The frontend (React/Vite SPA) is deployed to Vercel's global CDN.  
The backend (FastAPI + ML model + CVRP solver) runs as a Docker container on Railway.

---

## Step 1: Deploy Backend to Railway

### 1.1 Create the project

1. Go to [railway.app](https://railway.app) → sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select the `wastechakra` repository
4. Railway auto-detects `railway.json` and uses `backend/Dockerfile`

### 1.2 Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway automatically injects `DATABASE_URL` into your service environment — no manual copy needed

### 1.3 Set environment variables

In Railway dashboard → your service → **Variables**, add:

```
JWT_SECRET_KEY=<generate with: openssl rand -hex 32>
CORS_ORIGINS=["https://your-app.vercel.app","http://localhost:5173"]
DEBUG=false
FIRST_SUPERUSER_EMAIL=admin@ecofleet.ai
FIRST_SUPERUSER_PASSWORD=<strong password>
FIRST_SUPERUSER_FULL_NAME=EcoFleet Administrator
```

> `DATABASE_URL` is set automatically by the PostgreSQL plugin — do NOT set it manually.

### 1.4 Deploy

Railway builds the Docker image and starts the service automatically on every push to `master`.

**Copy your Railway URL** (e.g. `https://wastechakra-production.up.railway.app`) — you need it for Step 2.

### 1.5 Verify

```
https://your-backend.railway.app/health
# → {"status":"ok","service":"ecofleet-backend","environment":"production"}

https://your-backend.railway.app/docs
# → Swagger UI with all API endpoints
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Import project

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New Project** → import `wastechakra`
3. Configure build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Vite

### 2.2 Set environment variable

In Vercel → your project → **Settings** → **Environment Variables**, add:

```
VITE_API_BASE_URL=https://your-backend.railway.app
```

> This tells the frontend where to send API calls. Without this, API calls go to `/api` (same origin), which only works in Docker.

### 2.3 Deploy

Click **Deploy**. Vercel builds and deploys in ~90 seconds.

**Copy your Vercel URL** (e.g. `https://wastechakra.vercel.app`).

---

## Step 3: Update CORS on Railway

1. Go back to Railway → your service → **Variables**
2. Update `CORS_ORIGINS` with your actual Vercel URL:
   ```
   CORS_ORIGINS=["https://wastechakra.vercel.app","http://localhost:5173"]
   ```
3. Railway auto-redeploys (~1 min)

---

## Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | admin@ecofleet.ai | EcoFleet@2026 | Full access |
| **Fleet Manager** | manager@ecofleet.in | Fleet@2026 | Dashboard, routes, forecast, fleet, analytics |
| **Driver** | driver1@ecofleet.in | Driver@2026 | Driver navigation only |
| **Citizen** | — | — | `/report` page (no login needed) |

> Change passwords before any public competition demo.

---

## Continuous Deployment

Every push to `master` triggers:
- **Railway**: Docker rebuild + redeploy (via `deploy.yml` or Railway's GitHub integration)
- **Vercel**: Automatic frontend rebuild

The CI pipeline (`.github/workflows/ci.yml`) runs tests on every PR before merge.

---

## Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Vite proxies /api → http://localhost:8000 via vite.config.js
```

**Full stack with Docker:**
```bash
docker-compose -f docker-compose.dev.yml up --build
# Dashboard: http://localhost:5173
# API docs:  http://localhost:8000/docs
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Backend 500 on first start | `DATABASE_URL` not set | Check Railway Variables → PostgreSQL plugin linked |
| Login returns 422 | Email/password format | Use exact demo credentials above |
| CORS error in browser | `CORS_ORIGINS` missing Vercel URL | Update in Railway Variables |
| Map tiles not loading | Browser blocks mixed content | Use HTTPS for both frontend and backend |
| Forecast returns mock data | Normal on empty DB | Real data accumulates after collections |
| `MODULE_NOT_FOUND` on Railway | Docker build failed | Check Railway build logs |
| Driver page shows wrong times | Old cached data | Hard refresh (Ctrl+Shift+R) |

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Set by Railway PostgreSQL plugin |
| `JWT_SECRET_KEY` | ✅ | weak dev key | Generate: `openssl rand -hex 32` |
| `CORS_ORIGINS` | ✅ | localhost only | JSON array of allowed origins |
| `DEBUG` | — | `false` | Set `true` for verbose logs |
| `FIRST_SUPERUSER_EMAIL` | — | admin@ecofleet.ai | Seeded on first startup |
| `FIRST_SUPERUSER_PASSWORD` | — | EcoFleet@2026 | Change before going live |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ (Vercel only) | Railway backend URL, no trailing slash |

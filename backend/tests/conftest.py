"""
Pytest configuration: async test client with SQLite in-memory DB.
"""
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Use SQLite in-memory for tests — no external DB needed
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Create all tables before test session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="session")
async def client():
    """Async HTTP test client with DB override."""
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Admin token fixture — registers admin and returns Bearer token
# ---------------------------------------------------------------------------

_ADMIN_EMAIL = "admin_test@ecofleet.ai"
_ADMIN_PASSWORD = "AdminTest@123"
_ADMIN_NAME = "Test Admin"


@pytest_asyncio.fixture(scope="session")
async def admin_token(client):
    """Provision an admin user directly in the test DB and return a valid JWT token.

    Self-registration always creates least-privilege "driver" accounts
    (see app/api/routes/auth.py), so admins must be provisioned
    out-of-band — exactly as operators do via FIRST_SUPERUSER seeding.
    """
    from sqlalchemy import select

    from app.core.security import get_password_hash
    from app.db.models import User

    async with TestSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == _ADMIN_EMAIL))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                email=_ADMIN_EMAIL,
                hashed_password=get_password_hash(_ADMIN_PASSWORD),
                full_name=_ADMIN_NAME,
                role="admin",
                is_active=True,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)

    login = await client.post("/api/auth/login", json={
        "email": _ADMIN_EMAIL,
        "password": _ADMIN_PASSWORD,
    })
    data = login.json()
    return data["access_token"]


@pytest_asyncio.fixture(scope="session")
async def auth_headers(admin_token):
    """Return Authorization headers dict for an admin user."""
    return {"Authorization": f"Bearer {admin_token}"}

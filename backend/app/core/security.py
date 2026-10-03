"""
JWT authentication and password hashing utilities.
Uses python-jose for JWT and passlib[bcrypt] for password hashing.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Token models
# ---------------------------------------------------------------------------

class TokenData(BaseModel):
    user_id: int
    email: str
    role: str


# ---------------------------------------------------------------------------
# OAuth2 scheme
# ---------------------------------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    to_encode["iat"] = datetime.now(timezone.utc)
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> TokenData:
    """Decode and validate a JWT access token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        if user_id is None or email is None:
            raise credentials_exception
        return TokenData(user_id=int(user_id), email=email, role=role or "driver")
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise credentials_exception from exc


# ---------------------------------------------------------------------------
# FastAPI dependency: current user
# ---------------------------------------------------------------------------

async def get_current_user_token(token: str = Depends(oauth2_scheme)) -> TokenData:
    """FastAPI dependency that extracts and validates the JWT from the request."""
    return verify_token(token)


def require_role(*roles: str):
    """
    Dependency factory that checks the current user has one of the given roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
    """
    async def _check(token_data: TokenData = Depends(get_current_user_token)) -> TokenData:
        if token_data.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of roles: {list(roles)}",
            )
        return token_data
    return _check

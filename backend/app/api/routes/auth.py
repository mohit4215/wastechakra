"""
API Route: /api/auth — Authentication, registration, and user management
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    TokenData,
    create_access_token,
    get_current_user_token,
    get_password_hash,
    require_role,
    verify_password,
)
from app.db.models import User
from app.models.schemas import Token, UserCreate, UserLogin, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register user")
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new fleet manager, driver, or admin."""
    # Check if email already taken
    stmt = select(User).where(User.email == body.email.strip().lower())
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    user = User(
        email=body.email.strip().lower(),
        hashed_password=get_password_hash(body.password),
        full_name=body.full_name.strip(),
        role=body.role.value if hasattr(body.role, "value") else str(body.role),
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token, summary="Login and obtain JWT token")
async def login(
    body: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user via JSON body and return JWT bearer token.
    """
    email = body.email
    password = body.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    stmt = select(User).where(User.email == email.strip().lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    # If database has no users yet and credentials match default superuser, seed it dynamically
    if not user and email.strip().lower() == settings.FIRST_SUPERUSER_EMAIL.lower():
        if password == settings.FIRST_SUPERUSER_PASSWORD:
            user = User(
                email=settings.FIRST_SUPERUSER_EMAIL.lower(),
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                full_name=settings.FIRST_SUPERUSER_FULL_NAME,
                role="admin",
                is_active=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
    }
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse, summary="Get current logged in user")
async def get_me(
    current_token: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details of the currently authenticated user."""
    stmt = select(User).where(User.id == current_token.user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users", response_model=List[UserResponse], summary="List all users (Admin only)")
async def list_users(
    token_data: TokenData = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    """List all registered system users (Admins and Managers only)."""
    stmt = select(User).order_by(User.id.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

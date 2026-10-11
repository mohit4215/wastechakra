"""
Shared slowapi rate limiter.

Kept in its own module so route modules can decorate endpoints with
``@limiter.limit(...)`` without importing ``app.main`` (which would
create a circular import).
"""
from __future__ import annotations

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# In-memory storage; set storage_uri to Redis for multi-worker deployments.
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

__all__ = ["limiter", "_rate_limit_exceeded_handler", "RateLimitExceeded"]

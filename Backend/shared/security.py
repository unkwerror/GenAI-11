from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from shared.auth_utils import JWTHandler
from shared.models import User


class SecurityError(Exception):
    """Base error for security helpers."""


class InvalidTokenError(SecurityError):
    """Raised when the JWT payload cannot be decoded."""


class UserNotFoundError(SecurityError):
    """Raised when a token references a missing user."""


class InactiveUserError(SecurityError):
    """Raised when the subject user is disabled."""


@dataclass(slots=True)
class AuthContext:
    """Resolved authentication context."""

    user: User


def resolve_user_from_token(token: str, session: Session) -> AuthContext:
    """Decode JWT token and load the corresponding active user."""

    try:
        payload = JWTHandler.verify_token(token)
        raw_user_id = payload.get("sub")
        user_id = int(raw_user_id)
    except Exception as exc:
        raise InvalidTokenError("Невалидный токен") from exc

    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError("Пользователь не найден")

    if not user.is_active:
        raise InactiveUserError("Пользователь неактивен")

    return AuthContext(user=user)



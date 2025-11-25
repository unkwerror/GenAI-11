from datetime import datetime

from shared.auth_utils import JWTHandler, PasswordHandler
from shared.models import User

from app.domain.schemas import (
    TokenPair,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.repositories.user_repository import UserRepository
from app.services.errors import (
    DuplicateUserError,
    InactiveUserError,
    InvalidCredentialsError,
    TokenValidationError,
)


class AuthService:
    """Contains the core authentication use cases."""

    def __init__(self, repository: UserRepository):
        self._repository = repository

    def register(self, payload: UserRegisterRequest) -> User:
        if self._repository.get_by_email(payload.email) or self._repository.get_by_username(
            payload.username
        ):
            raise DuplicateUserError("Email или username уже зарегистрирован")

        hashed_password = PasswordHandler.hash_password(payload.password)
        return self._repository.create_user(payload.email, payload.username, hashed_password)

    def login(self, payload: UserLoginRequest) -> TokenPair:
        user = self._repository.get_by_email(payload.email)
        if not user or not PasswordHandler.verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsError("Неверные учётные данные")

        if not user.is_active:
            raise InactiveUserError("Пользователь неактивен")

        return self._issue_tokens(user)

    def refresh_tokens(self, token: str) -> TokenPair:
        user = self._resolve_user_from_token(token)
        return self._issue_tokens(user, refresh_override=token)

    def get_current_user(self, token: str) -> User:
        return self._resolve_user_from_token(token)

    def _issue_tokens(self, user: User, refresh_override: str | None = None) -> TokenPair:
        access_token = JWTHandler.create_access_token(
            {"sub": str(user.id), "email": user.email, "iat": datetime.utcnow().timestamp()}
        )
        refresh_token = refresh_override or JWTHandler.create_refresh_token({"sub": str(user.id)})
        return TokenPair(access_token=access_token, refresh_token=refresh_token)

    def _resolve_user_from_token(self, token: str) -> User:
        try:
            payload = JWTHandler.verify_token(token)
            raw_user_id = payload.get("sub")
            user_id = int(raw_user_id)
        except Exception as exc:
            raise TokenValidationError("Невалидный токен") from exc

        user = self._repository.get_by_id(user_id)
        if not user:
            raise TokenValidationError("Пользователь не найден")

        if not user.is_active:
            raise InactiveUserError("Пользователь неактивен")

        return user


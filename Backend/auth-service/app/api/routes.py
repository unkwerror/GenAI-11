from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.api.dependencies import get_auth_service
from app.domain.schemas import (
    MessageResponse,
    TokenPair,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.errors import (
    DuplicateUserError,
    InactiveUserError,
    InvalidCredentialsError,
    TokenValidationError,
)

router = APIRouter(tags=["Auth"])
security = HTTPBearer()


@router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "Auth Service is running"}


@router.post("/register", response_model=UserResponse)
def register_user(
    payload: UserRegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        return auth_service.register(payload)
    except DuplicateUserError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login", response_model=TokenPair)
def login_user(
    payload: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        return auth_service.login(payload)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except InactiveUserError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.post("/refresh", response_model=TokenPair)
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        return auth_service.refresh_tokens(credentials.credentials)
    except TokenValidationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=UserResponse)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        return auth_service.get_current_user(credentials.credentials)
    except TokenValidationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except InactiveUserError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.post("/logout", response_model=MessageResponse)
def logout() -> MessageResponse:
    return MessageResponse(message="Успешно вышли. Удалите токены на клиенте.")


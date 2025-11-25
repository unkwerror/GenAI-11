from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.security import (
    AuthContext,
    InactiveUserError,
    InvalidTokenError,
    UserNotFoundError,
    resolve_user_from_token,
)

from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService

security = HTTPBearer()


def get_todo_service(db: Session = Depends(get_db)) -> TodoService:
    repository = TodoRepository(db)
    return TodoService(repository)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> AuthContext:
    try:
        return resolve_user_from_token(credentials.credentials, db)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except InactiveUserError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc



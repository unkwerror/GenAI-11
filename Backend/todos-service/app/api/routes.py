from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_todo_service
from app.domain.schemas import TodoCreateRequest, TodoResponse, TodoUpdateRequest
from app.services.todo_service import TodoService
from app.services.errors import TodoNotFoundError
from shared.security import AuthContext

router = APIRouter(prefix="/todos", tags=["Todos"])


@router.get("", response_model=list[TodoResponse])
def list_todos(
    auth: AuthContext = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    return service.list_todos(auth.user.id)


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    payload: TodoCreateRequest,
    auth: AuthContext = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    return service.create_todo(auth.user.id, payload)


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    auth: AuthContext = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    try:
        return service.get_todo(auth.user.id, todo_id)
    except TodoNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    payload: TodoUpdateRequest,
    auth: AuthContext = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    try:
        return service.update_todo(auth.user.id, todo_id, payload)
    except TodoNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    auth: AuthContext = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    try:
        service.delete_todo(auth.user.id, todo_id)
    except TodoNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return None



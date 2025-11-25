from typing import Any, Dict

from fastapi import APIRouter, Depends, Header, status
from httpx import HTTPStatusError

from app.api.dependencies import get_todos_client
from app.api.errors import translate_http_error
from app.clients.todos_client import TodosClient


router = APIRouter(prefix="/api/todos", tags=["Todos"])


@router.get("")
async def list_todos(
    authorization: str = Header(...),
    client: TodosClient = Depends(get_todos_client),
):
    try:
        return await client.list_todos(authorization)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_todo(
    payload: Dict[str, Any],
    authorization: str = Header(...),
    client: TodosClient = Depends(get_todos_client),
):
    try:
        return await client.create_todo(authorization, payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.get("/{todo_id}")
async def get_todo(
    todo_id: int,
    authorization: str = Header(...),
    client: TodosClient = Depends(get_todos_client),
):
    try:
        return await client.get_todo(authorization, todo_id)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.put("/{todo_id}")
async def update_todo(
    todo_id: int,
    payload: Dict[str, Any],
    authorization: str = Header(...),
    client: TodosClient = Depends(get_todos_client),
):
    try:
        return await client.update_todo(authorization, todo_id, payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    authorization: str = Header(...),
    client: TodosClient = Depends(get_todos_client),
):
    try:
        await client.delete_todo(authorization, todo_id)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


from __future__ import annotations

from datetime import datetime

from shared.models import Todo

from app.domain.schemas import TodoCreateRequest, TodoUpdateRequest
from app.repositories.todo_repository import TodoRepository
from app.services.errors import TodoNotFoundError


class TodoService:
    """Application service encapsulating todo operations."""

    def __init__(self, repository: TodoRepository):
        self._repository = repository

    def list_todos(self, user_id: int) -> list[Todo]:
        return list(self._repository.list_for_user(user_id))

    def create_todo(self, user_id: int, payload: TodoCreateRequest) -> Todo:
        data = payload.model_dump()
        return self._repository.create(user_id=user_id, **data)

    def get_todo(self, user_id: int, todo_id: int) -> Todo:
        todo = self._repository.get_for_user(user_id, todo_id)
        if not todo:
            raise TodoNotFoundError("Todo not found")
        return todo

    def update_todo(self, user_id: int, todo_id: int, payload: TodoUpdateRequest) -> Todo:
        todo = self.get_todo(user_id, todo_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(todo, field, value)
        todo.updated_at = datetime.utcnow()
        return self._repository.save(todo)

    def delete_todo(self, user_id: int, todo_id: int) -> None:
        todo = self.get_todo(user_id, todo_id)
        self._repository.delete(todo)



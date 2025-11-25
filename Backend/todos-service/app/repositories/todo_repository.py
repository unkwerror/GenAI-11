from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime

from sqlalchemy.orm import Session

from shared.models import Todo


class TodoRepository:
    """Data access abstraction for todos."""

    def __init__(self, session: Session):
        self._session = session

    def list_for_user(self, user_id: int) -> Sequence[Todo]:
        return self._session.query(Todo).filter(Todo.user_id == user_id).all()

    def get_for_user(self, user_id: int, todo_id: int) -> Todo | None:
        return (
            self._session.query(Todo)
            .filter((Todo.id == todo_id) & (Todo.user_id == user_id))
            .first()
        )

    def create(
        self,
        *,
        user_id: int,
        title: str,
        description: str | None,
        completed: bool,
        priority: str,
        category: str,
        due_date: datetime | None,
        tags: str | None,
    ) -> Todo:
        todo = Todo(
            user_id=user_id,
            title=title,
            description=description,
            completed=completed,
            priority=priority,
            category=category,
            due_date=due_date,
            tags=tags,
        )
        self._session.add(todo)
        self._session.commit()
        self._session.refresh(todo)
        return todo

    def save(self, todo: Todo) -> Todo:
        self._session.add(todo)
        self._session.commit()
        self._session.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        self._session.delete(todo)
        self._session.commit()



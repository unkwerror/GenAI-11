from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime

from sqlalchemy.orm import Session

from shared.models import Event


class EventRepository:
    """Data access layer for events."""

    def __init__(self, session: Session):
        self._session = session

    def list_for_user(self, user_id: int) -> Sequence[Event]:
        return (
            self._session.query(Event)
            .filter(Event.user_id == user_id)
            .order_by(Event.start_time)
            .all()
        )

    def get_for_user(self, user_id: int, event_id: int) -> Event | None:
        return (
            self._session.query(Event)
            .filter((Event.id == event_id) & (Event.user_id == user_id))
            .first()
        )

    def create(
        self,
        *,
        user_id: int,
        title: str,
        description: str | None,
        start_time: datetime,
        end_time: datetime,
        color: str | None,
        source: str | None,
        reminder_enabled: bool,
        reminder_time: int | None,
        reminder_type: str | None,
        tags: str | None,
    ) -> Event:
        event = Event(
            user_id=user_id,
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time,
            color=color or "#3b82f6",
            source=source or "local",
            reminder_enabled=reminder_enabled,
            reminder_time=reminder_time,
            reminder_type=reminder_type,
            tags=tags,
        )
        self._session.add(event)
        self._session.commit()
        self._session.refresh(event)
        return event

    def save(self, event: Event) -> Event:
        self._session.add(event)
        self._session.commit()
        self._session.refresh(event)
        return event

    def delete(self, event: Event) -> None:
        self._session.delete(event)
        self._session.commit()



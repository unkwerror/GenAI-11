from __future__ import annotations

from datetime import datetime

from shared.models import Event

from app.domain.schemas import EventCreateRequest, EventUpdateRequest
from app.repositories.event_repository import EventRepository
from app.services.errors import EventNotFoundError, InvalidEventTimingError


class EventService:
    """Application service encapsulating event use cases."""

    def __init__(self, repository: EventRepository):
        self._repository = repository

    def list_events(self, user_id: int) -> list[Event]:
        return list(self._repository.list_for_user(user_id))

    def create_event(self, user_id: int, payload: EventCreateRequest) -> Event:
        self._ensure_valid_timing(payload.start_time, payload.end_time)
        data = payload.model_dump()
        return self._repository.create(user_id=user_id, **data)

    def get_event(self, user_id: int, event_id: int) -> Event:
        event = self._repository.get_for_user(user_id, event_id)
        if not event:
            raise EventNotFoundError("Event not found")
        return event

    def update_event(self, user_id: int, event_id: int, payload: EventUpdateRequest) -> Event:
        event = self.get_event(user_id, event_id)
        update_data = payload.model_dump(exclude_unset=True)

        start_time = update_data.get("start_time", event.start_time)
        end_time = update_data.get("end_time", event.end_time)
        self._ensure_valid_timing(start_time, end_time)

        for field, value in update_data.items():
            setattr(event, field, value)
        event.updated_at = datetime.utcnow()
        return self._repository.save(event)

    def delete_event(self, user_id: int, event_id: int) -> None:
        event = self.get_event(user_id, event_id)
        self._repository.delete(event)

    @staticmethod
    def _ensure_valid_timing(start_time: datetime, end_time: datetime) -> None:
        if end_time <= start_time:
            raise InvalidEventTimingError("end_time must be greater than start_time")



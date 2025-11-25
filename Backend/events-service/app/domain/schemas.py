from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator


class EventBase(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = Field(default="#3b82f6", max_length=7)
    source: Optional[str] = Field(default="local")
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[int] = Field(default=15, ge=0)
    reminder_type: Optional[str] = Field(default="notification")
    tags: Optional[str] = None

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, value: datetime | None, info: ValidationInfo) -> datetime | None:
        start_time = (info.data or {}).get("start_time")
        if value and start_time and value <= start_time:
            raise ValueError("end_time must be greater than start_time")
        return value


class EventCreateRequest(EventBase):
    title: str
    start_time: datetime
    end_time: datetime


class EventUpdateRequest(EventBase):
    """Partial update payload."""


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    color: str
    source: str
    reminder_enabled: bool
    reminder_time: Optional[int]
    reminder_type: Optional[str]
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime



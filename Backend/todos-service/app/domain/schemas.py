from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = False
    priority: Optional[str] = Field(default="medium")
    category: Optional[str] = Field(default="general")
    due_date: Optional[datetime] = None
    tags: Optional[str] = None


class TodoCreateRequest(TodoBase):
    title: str


class TodoUpdateRequest(TodoBase):
    """Partial update payload."""


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    category: str
    due_date: Optional[datetime]
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime



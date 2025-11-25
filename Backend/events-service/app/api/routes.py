from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_event_service
from shared.security import AuthContext
from app.domain.schemas import (
    EventCreateRequest,
    EventResponse,
    EventUpdateRequest,
)
from app.services.event_service import EventService
from app.services.errors import EventNotFoundError, InvalidEventTimingError

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=list[EventResponse])
def list_events(
    auth: AuthContext = Depends(get_current_user),
    service: EventService = Depends(get_event_service),
):
    return service.list_events(auth.user.id)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreateRequest,
    auth: AuthContext = Depends(get_current_user),
    service: EventService = Depends(get_event_service),
):
    try:
        return service.create_event(auth.user.id, payload)
    except InvalidEventTimingError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    auth: AuthContext = Depends(get_current_user),
    service: EventService = Depends(get_event_service),
):
    try:
        return service.get_event(auth.user.id, event_id)
    except EventNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    payload: EventUpdateRequest,
    auth: AuthContext = Depends(get_current_user),
    service: EventService = Depends(get_event_service),
):
    try:
        return service.update_event(auth.user.id, event_id, payload)
    except EventNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidEventTimingError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    auth: AuthContext = Depends(get_current_user),
    service: EventService = Depends(get_event_service),
):
    try:
        service.delete_event(auth.user.id, event_id)
    except EventNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return None



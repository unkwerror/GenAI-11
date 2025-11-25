from typing import Any, Dict

from fastapi import APIRouter, Depends, Header, status
from httpx import HTTPStatusError

from app.api.dependencies import get_events_client
from app.api.errors import translate_http_error
from app.clients.events_client import EventsClient


router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("")
async def list_events(
    authorization: str = Header(...),
    client: EventsClient = Depends(get_events_client),
):
    try:
        return await client.list_events(authorization)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: Dict[str, Any],
    authorization: str = Header(...),
    client: EventsClient = Depends(get_events_client),
):
    try:
        return await client.create_event(authorization, payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.get("/{event_id}")
async def get_event(
    event_id: int,
    authorization: str = Header(...),
    client: EventsClient = Depends(get_events_client),
):
    try:
        return await client.get_event(authorization, event_id)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.put("/{event_id}")
async def update_event(
    event_id: int,
    payload: Dict[str, Any],
    authorization: str = Header(...),
    client: EventsClient = Depends(get_events_client),
):
    try:
        return await client.update_event(authorization, event_id, payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    authorization: str = Header(...),
    client: EventsClient = Depends(get_events_client),
):
    try:
        await client.delete_event(authorization, event_id)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


from fastapi import Depends

from app.clients.auth_client import AuthClient
from app.clients.events_client import EventsClient
from app.clients.todos_client import TodosClient
from app.core.config import get_settings


def get_auth_client(settings=Depends(get_settings)) -> AuthClient:
    return AuthClient(settings.auth_service_url, settings.request_timeout, settings.connect_timeout)


def get_events_client(settings=Depends(get_settings)) -> EventsClient:
    return EventsClient(
        settings.events_service_url, settings.request_timeout, settings.connect_timeout
    )


def get_todos_client(settings=Depends(get_settings)) -> TodosClient:
    return TodosClient(
        settings.todos_service_url, settings.request_timeout, settings.connect_timeout
    )


from typing import Any

from app.clients.base import ServiceClient


class EventsClient(ServiceClient):
    async def list_events(self, authorization: str) -> Any:
        return await self._request(
            "GET", "/events", headers={"Authorization": authorization}
        )

    async def create_event(self, authorization: str, payload: dict[str, Any]) -> Any:
        return await self._request(
            "POST",
            "/events",
            headers={"Authorization": authorization},
            json=payload,
        )

    async def get_event(self, authorization: str, event_id: int) -> Any:
        return await self._request(
            "GET",
            f"/events/{event_id}",
            headers={"Authorization": authorization},
        )

    async def update_event(self, authorization: str, event_id: int, payload: dict[str, Any]) -> Any:
        return await self._request(
            "PUT",
            f"/events/{event_id}",
            headers={"Authorization": authorization},
            json=payload,
        )

    async def delete_event(self, authorization: str, event_id: int) -> Any:
        return await self._request(
            "DELETE",
            f"/events/{event_id}",
            headers={"Authorization": authorization},
        )


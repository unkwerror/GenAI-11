from typing import Any

from app.clients.base import ServiceClient


class AuthClient(ServiceClient):
    async def register(self, payload: dict[str, Any]) -> Any:
        return await self._request("POST", "/register", json=payload)

    async def login(self, payload: dict[str, Any]) -> Any:
        return await self._request("POST", "/login", json=payload)

    async def refresh(self, authorization: str) -> Any:
        return await self._request(
            "POST",
            "/refresh",
            headers={"Authorization": authorization},
        )

    async def current_user(self, authorization: str) -> Any:
        return await self._request(
            "GET",
            "/me",
            headers={"Authorization": authorization},
        )

    async def logout(self) -> Any:
        return await self._request("POST", "/logout")


from typing import Any

from app.clients.base import ServiceClient


class TodosClient(ServiceClient):
    async def list_todos(self, authorization: str) -> Any:
        return await self._request(
            "GET", "/todos", headers={"Authorization": authorization}
        )

    async def create_todo(self, authorization: str, payload: dict[str, Any]) -> Any:
        return await self._request(
            "POST",
            "/todos",
            headers={"Authorization": authorization},
            json=payload,
        )

    async def get_todo(self, authorization: str, todo_id: int) -> Any:
        return await self._request(
            "GET",
            f"/todos/{todo_id}",
            headers={"Authorization": authorization},
        )

    async def update_todo(self, authorization: str, todo_id: int, payload: dict[str, Any]) -> Any:
        return await self._request(
            "PUT",
            f"/todos/{todo_id}",
            headers={"Authorization": authorization},
            json=payload,
        )

    async def delete_todo(self, authorization: str, todo_id: int) -> Any:
        return await self._request(
            "DELETE",
            f"/todos/{todo_id}",
            headers={"Authorization": authorization},
        )


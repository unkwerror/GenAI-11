from __future__ import annotations

from typing import Any

import httpx


class ServiceClient:
    """Base HTTP client with shared request logic."""

    def __init__(self, base_url: str, timeout: float, connect_timeout: float):
        self._base_url = base_url.rstrip("/")
        self._timeout = httpx.Timeout(timeout, connect=connect_timeout)

    async def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        url = f"{self._base_url}{path}"
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return _extract_response_body(response)


def _extract_response_body(response: httpx.Response) -> Any:
    if "application/json" in response.headers.get("content-type", ""):
        return response.json()
    return response.text


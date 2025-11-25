from typing import Any, Dict

from fastapi import APIRouter, Depends, Header
from httpx import HTTPStatusError

from app.api.dependencies import get_auth_client
from app.api.errors import translate_http_error
from app.clients.auth_client import AuthClient


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
async def register_user(
    payload: Dict[str, Any],
    client: AuthClient = Depends(get_auth_client),
):
    try:
        return await client.register(payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.post("/login")
async def login_user(
    payload: Dict[str, Any],
    client: AuthClient = Depends(get_auth_client),
):
    try:
        return await client.login(payload)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.post("/refresh")
async def refresh_token(
    authorization: str = Header(...),
    client: AuthClient = Depends(get_auth_client),
):
    try:
        return await client.refresh(authorization)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.get("/me")
async def get_current_user(
    authorization: str = Header(...),
    client: AuthClient = Depends(get_auth_client),
):
    try:
        return await client.current_user(authorization)
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


@router.post("/logout")
async def logout_user(
    client: AuthClient = Depends(get_auth_client),
):
    try:
        return await client.logout()
    except HTTPStatusError as exc:
        raise translate_http_error(exc)


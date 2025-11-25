from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, events, health, todos


def create_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health.router)
    router.include_router(auth.router)
    router.include_router(events.router)
    router.include_router(todos.router)
    return router


def apply_middlewares(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


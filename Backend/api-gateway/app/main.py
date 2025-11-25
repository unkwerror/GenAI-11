from fastapi import FastAPI

from app.api.router import apply_middlewares, create_api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="API Gateway", version="2.0.0", debug=settings.debug)
    apply_middlewares(app)
    app.include_router(create_api_router())
    return app


app = create_app()


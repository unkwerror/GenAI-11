from fastapi import FastAPI
from sqlalchemy.exc import IntegrityError

from shared.database import engine
from shared.models import Base

from app.api.routes import router as auth_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Auth Service", version="2.0.0", debug=settings.debug)

    try:
        Base.metadata.create_all(bind=engine)
    except IntegrityError as exc:
        if "pg_type_typname_nsp_index" not in str(exc):
            raise

    app.include_router(auth_router)
    return app


app = create_app()


from fastapi import APIRouter

from app.core.config import get_settings


router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict[str, dict[str, str] | str]:
    settings = get_settings()
    return {
        "status": "API Gateway is running",
        "services": {
            "auth": f"{settings.auth_service_url}/health",
            "events": f"{settings.events_service_url}/health",
            "todos": f"{settings.todos_service_url}/health",
        },
    }


from functools import lru_cache
from pydantic import BaseModel, Field


class Settings(BaseModel):
    auth_service_url: str = Field(default="http://auth-service:8001", alias="AUTH_SERVICE_URL")
    events_service_url: str = Field(default="http://events-service:8002", alias="EVENTS_SERVICE_URL")
    todos_service_url: str = Field(default="http://todos-service:8003", alias="TODOS_SERVICE_URL")
    request_timeout: float = Field(default=30.0, alias="GATEWAY_TIMEOUT")
    connect_timeout: float = Field(default=10.0, alias="GATEWAY_CONNECT_TIMEOUT")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")

    class Config:
        populate_by_name = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


from functools import lru_cache
from pydantic import BaseModel, Field


class Settings(BaseModel):
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")

    class Config:
        populate_by_name = True


@lru_cache
def get_settings() -> Settings:
    return Settings()



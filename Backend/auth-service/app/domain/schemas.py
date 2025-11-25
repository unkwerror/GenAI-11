from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime


class MessageResponse(BaseModel):
    message: str


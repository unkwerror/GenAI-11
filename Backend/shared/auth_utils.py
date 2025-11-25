from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class JWTHandler:
    """Обработка JWT токенов"""
    
    SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-this")
    ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE = int(os.getenv("JWT_EXPIRATION", 3600))
    REFRESH_TOKEN_EXPIRE = int(os.getenv("JWT_REFRESH_EXPIRATION", 604800))

    @classmethod
    def create_access_token(cls, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Создать access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(seconds=cls.ACCESS_TOKEN_EXPIRE)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def create_refresh_token(cls, data: dict) -> str:
        """Создать refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(seconds=cls.REFRESH_TOKEN_EXPIRE)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def verify_token(cls, token: str) -> dict:
        """Проверить токен"""
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except JWTError:
            raise Exception("Невалидный токен")


class PasswordHandler:
    """Обработка паролей"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Хешировать пароль"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Проверить пароль"""
        return pwd_context.verify(password, hashed_password)

from sqlalchemy.orm import Session

from shared.models import User


class UserRepository:
    """Encapsulates data access for user entities."""

    def __init__(self, session: Session):
        self._session = session

    def get_by_email(self, email: str) -> User | None:
        return self._session.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> User | None:
        return self._session.query(User).filter(User.username == username).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self._session.query(User).filter(User.id == user_id).first()

    def create_user(self, email: str, username: str, hashed_password: str) -> User:
        user = User(email=email, username=username, hashed_password=hashed_password)
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user


class TodoServiceError(Exception):
    """Base error for todo service."""


class TodoNotFoundError(TodoServiceError):
    """Raised when todo entity is missing."""



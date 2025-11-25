class AuthServiceError(Exception):
    """Base class for auth service errors."""


class DuplicateUserError(AuthServiceError):
    """Raised when attempting to create a user that already exists."""


class InvalidCredentialsError(AuthServiceError):
    """Raised when login credentials are incorrect."""


class InactiveUserError(AuthServiceError):
    """Raised when an inactive user attempts to authenticate."""


class TokenValidationError(AuthServiceError):
    """Raised when decoding or validating a JWT fails."""


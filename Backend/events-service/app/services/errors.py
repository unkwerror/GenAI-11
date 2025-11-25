class EventServiceError(Exception):
    """Base error for event service."""


class EventNotFoundError(EventServiceError):
    """Raised when event is missing."""


class InvalidEventTimingError(EventServiceError):
    """Raised when start/end time is invalid."""



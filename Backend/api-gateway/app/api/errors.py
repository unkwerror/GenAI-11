from fastapi import HTTPException
from httpx import HTTPStatusError


def translate_http_error(error: HTTPStatusError) -> HTTPException:
    try:
        detail = error.response.json()
        if isinstance(detail, dict) and "detail" in detail:
            detail = detail["detail"]
    except ValueError:
        detail = error.response.text
    return HTTPException(status_code=error.response.status_code, detail=detail)


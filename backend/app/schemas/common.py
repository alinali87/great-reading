from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Schema for error responses"""

    error: str
    message: str
    details: dict | None = None

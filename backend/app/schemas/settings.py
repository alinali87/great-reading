from datetime import datetime

from pydantic import BaseModel, Field

from app.models.settings import ReadingMode


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings"""

    timer_duration: int | None = Field(None, ge=1, le=120)
    reading_mode: ReadingMode | None = None


class UserSettingsResponse(BaseModel):
    """Schema for user settings response"""

    user_id: str
    timer_duration: int = Field(..., ge=1, le=120)
    reading_mode: ReadingMode
    updated_at: datetime

    class Config:
        from_attributes = True

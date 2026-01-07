from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.settings import ReadingMode


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings"""

    timer_duration: int | None = Field(
        None,
        ge=1,
        le=120,
        validation_alias="timerDuration",
        serialization_alias="timerDuration",
    )
    reading_mode: ReadingMode | None = Field(
        None, validation_alias="readingMode", serialization_alias="readingMode"
    )

    model_config = ConfigDict(populate_by_name=True)


class UserSettingsResponse(BaseModel):
    """Schema for user settings response"""

    user_id: str = Field(..., serialization_alias="userId")
    timer_duration: int = Field(..., ge=1, le=120, serialization_alias="timerDuration")
    reading_mode: ReadingMode = Field(..., serialization_alias="readingMode")
    updated_at: datetime = Field(..., serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

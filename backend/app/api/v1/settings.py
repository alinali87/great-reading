from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import settings as app_settings
from app.db.database import get_db
from app.models.settings import ReadingMode, UserSettings
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()

# Temporary user ID for MVP (single user)
TEMP_USER_ID = "default-user"


@router.get("", response_model=UserSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Get user settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == TEMP_USER_ID).first()
    )

    # Create default settings if not exists
    if not settings:
        settings = UserSettings(
            user_id=TEMP_USER_ID, timer_duration=5, reading_mode=ReadingMode.PAGE
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Add dev_mode from app settings
    response = UserSettingsResponse.model_validate(settings)
    response.dev_mode = app_settings.DEV_MODE

    return response


@router.patch("", response_model=UserSettingsResponse)
def update_settings(settings_update: UserSettingsUpdate, db: Session = Depends(get_db)):
    """Update user settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == TEMP_USER_ID).first()
    )

    # Create if not exists
    if not settings:
        settings = UserSettings(
            user_id=TEMP_USER_ID, timer_duration=5, reading_mode=ReadingMode.PAGE
        )
        db.add(settings)

    # Update fields
    if settings_update.timer_duration is not None:
        settings.timer_duration = settings_update.timer_duration

    if settings_update.reading_mode is not None:
        settings.reading_mode = settings_update.reading_mode

    db.commit()
    db.refresh(settings)

    # Add dev_mode from app settings
    response = UserSettingsResponse.model_validate(settings)
    response.dev_mode = app_settings.DEV_MODE

    return response

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings as app_settings
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.settings import ReadingMode, UserSettings
from app.models.user import User
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    # Create default settings if not exists
    if not settings:
        settings = UserSettings(
            user_id=current_user.id, timer_duration=5, reading_mode=ReadingMode.PAGE
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Add dev_mode from app settings
    response = UserSettingsResponse.model_validate(settings)
    response.dev_mode = app_settings.DEV_MODE

    return response


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    # Create if not exists
    if not settings:
        settings = UserSettings(
            user_id=current_user.id, timer_duration=5, reading_mode=ReadingMode.PAGE
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

import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String

from app.db.database import Base


class ReadingMode(str, enum.Enum):
    PAGE = "page"
    SENTENCE = "sentence"


class UserSettings(Base):
    """User settings model"""

    __tablename__ = "user_settings"

    user_id = Column(String, primary_key=True, index=True)
    timer_duration = Column(Integer, default=5, nullable=False)
    reading_mode = Column(Enum(ReadingMode), default=ReadingMode.PAGE, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Book(Base):
    """Book model for storing uploaded PDF books"""

    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(
        String, index=True, nullable=False
    )  # For future multi-user support
    name = Column(String, nullable=False)
    content = Column(JSON, nullable=False)  # Array of page contents
    current_page = Column(Integer, default=0, nullable=False)
    total_pages = Column(Integer, nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

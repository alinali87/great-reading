from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.db.database import Base


class DictionaryWord(Base):
    __tablename__ = "dictionary_words"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(
        String, index=True, nullable=False
    )  # For future multi-user support
    word = Column(String, nullable=False, index=True)
    definition = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

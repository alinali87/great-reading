from datetime import datetime

from pydantic import BaseModel, Field


class DictionaryWordBase(BaseModel):
    """Base schema for DictionaryWord"""

    word: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1, max_length=1000)


class DictionaryWordCreate(DictionaryWordBase):
    """Schema for creating a dictionary word"""

    context: str | None = Field(None, max_length=500)


class DictionaryWordResponse(DictionaryWordBase):
    """Schema for dictionary word response"""

    id: str
    context: str | None = None
    added_at: datetime

    class Config:
        from_attributes = True


class DictionaryListResponse(BaseModel):
    """Schema for list of dictionary words response"""

    words: list[DictionaryWordResponse]
    total: int
    limit: int
    offset: int


class WordExistsResponse(BaseModel):
    """Schema for word existence check response"""

    exists: bool
    word: str


class WordDefinitionItem(BaseModel):
    """Schema for a single word definition"""

    part_of_speech: str
    definition: str
    example: str | None = None


class WordDefinitionResponse(BaseModel):
    """Schema for word definition response"""

    word: str
    definitions: list[WordDefinitionItem]
    phonetic: str | None = None
    audio_url: str | None = None


class WordPronunciationResponse(BaseModel):
    """Schema for word pronunciation response"""

    word: str
    audio_url: str
    phonetic: str | None = None

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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
    added_at: datetime = Field(..., serialization_alias="addedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


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

    part_of_speech: str = Field(..., serialization_alias="partOfSpeech")
    definition: str
    example: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class WordDefinitionResponse(BaseModel):
    """Schema for word definition response"""

    word: str
    definitions: list[WordDefinitionItem]
    phonetic: str | None = None
    audio_url: str | None = Field(None, serialization_alias="audioUrl")

    model_config = ConfigDict(populate_by_name=True)


class WordPronunciationResponse(BaseModel):
    """Schema for word pronunciation response"""

    word: str
    audio_url: str = Field(..., serialization_alias="audioUrl")
    phonetic: str | None = None

    model_config = ConfigDict(populate_by_name=True)

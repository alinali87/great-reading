from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    """Base schema for Book"""

    name: str = Field(..., min_length=1, max_length=255)


class BookCreate(BookBase):
    """Schema for creating a book"""

    content: list[str] = Field(..., min_length=1)
    file_size: int = Field(..., gt=0)


class BookUpdate(BaseModel):
    """Schema for updating a book"""

    current_page: int = Field(
        ..., ge=0, validation_alias="currentPage", serialization_alias="currentPage"
    )

    model_config = ConfigDict(populate_by_name=True)


class BookResponse(BookBase):
    """Schema for book response"""

    id: str
    content: list[str]
    current_page: int = Field(..., ge=0, serialization_alias="currentPage")
    total_pages: int = Field(..., gt=0, serialization_alias="totalPages")
    file_size: int = Field(..., serialization_alias="fileSize")
    created_at: datetime = Field(..., serialization_alias="createdAt")
    updated_at: datetime = Field(..., serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class BookListResponse(BaseModel):
    """Schema for list of books response"""

    books: list[BookResponse]

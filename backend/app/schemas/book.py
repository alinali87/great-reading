from datetime import datetime

from pydantic import BaseModel, Field


class BookBase(BaseModel):
    """Base schema for Book"""

    name: str = Field(..., min_length=1, max_length=255)


class BookCreate(BookBase):
    """Schema for creating a book"""

    content: list[str] = Field(..., min_length=1)
    file_size: int = Field(..., gt=0)


class BookUpdate(BaseModel):
    """Schema for updating a book"""

    current_page: int = Field(..., ge=0)


class BookResponse(BookBase):
    """Schema for book response"""

    id: str
    content: list[str]
    current_page: int = Field(..., ge=0)
    total_pages: int = Field(..., gt=0)
    file_size: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookListResponse(BaseModel):
    """Schema for list of books response"""

    books: list[BookResponse]

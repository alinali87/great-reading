import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.book import Book
from app.schemas.book import BookListResponse, BookResponse, BookUpdate
from app.services.pdf_service import pdf_service

router = APIRouter()

# Temporary user ID for MVP (single user)
TEMP_USER_ID = "default-user"


@router.get("", response_model=BookListResponse)
def list_books(db: Session = Depends(get_db)):
    """List all books uploaded by the user"""
    books = db.query(Book).filter(Book.user_id == TEMP_USER_ID).all()
    return BookListResponse(books=books)


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def upload_book(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a new PDF book"""

    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF files are supported",
        )

    # Read file content
    file_content = await file.read()
    file_size = len(file_content)

    # Validate file size
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum file size is {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB",
        )

    # Validate PDF
    if not pdf_service.validate_pdf(file_content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file"
        )

    # Extract text from PDF
    try:
        content = pdf_service.extract_text_from_pdf(file_content)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Create book name from filename (remove .pdf extension)
    book_name = file.filename
    if book_name.lower().endswith(".pdf"):
        book_name = book_name[:-4]

    # Check if book with same name already exists
    existing_book = (
        db.query(Book)
        .filter(Book.user_id == TEMP_USER_ID, Book.name == book_name)
        .first()
    )

    if existing_book:
        # Update existing book
        existing_book.content = content
        existing_book.total_pages = len(content)
        existing_book.file_size = file_size
        existing_book.current_page = 0
        db.commit()
        db.refresh(existing_book)
        return existing_book

    # Create new book
    book = Book(
        id=str(uuid.uuid4()),
        user_id=TEMP_USER_ID,
        name=book_name,
        content=content,
        current_page=0,
        total_pages=len(content),
        file_size=file_size,
    )

    db.add(book)
    db.commit()
    db.refresh(book)

    return book


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    """Get a specific book by ID"""
    book = (
        db.query(Book).filter(Book.id == book_id, Book.user_id == TEMP_USER_ID).first()
    )

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    return book


@router.patch("/{book_id}", response_model=BookResponse)
def update_book_progress(
    book_id: str, book_update: BookUpdate, db: Session = Depends(get_db)
):
    """Update book reading progress"""
    book = (
        db.query(Book).filter(Book.id == book_id, Book.user_id == TEMP_USER_ID).first()
    )

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    # Validate current_page is within bounds
    if book_update.current_page >= book.total_pages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid page number. Book has {book.total_pages} pages",
        )

    book.current_page = book_update.current_page
    db.commit()
    db.refresh(book)

    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str, db: Session = Depends(get_db)):
    """Delete a book"""
    book = (
        db.query(Book).filter(Book.id == book_id, Book.user_id == TEMP_USER_ID).first()
    )

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    db.delete(book)
    db.commit()

    return None

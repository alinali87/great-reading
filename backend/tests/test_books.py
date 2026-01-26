"""Tests for books endpoints"""

import io
import uuid

import pytest
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.models.book import Book


def create_test_pdf() -> bytes:
    """Create a simple test PDF file with text"""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(100, 750, "This is a test PDF document")
    c.drawString(100, 730, "Page 1 content")
    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer.read()


def test_list_books_empty(authenticated_client, test_user):
    """Test listing books when there are none"""
    response = authenticated_client.get("/api/v1/books")
    assert response.status_code == 200
    data = response.json()
    assert "books" in data
    assert data["books"] == []


def test_list_books_with_data(authenticated_client, db_session, test_user):
    """Test listing books when there are some"""
    # Create test books for the test user
    book1 = Book(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Test Book 1",
        content=["Page 1", "Page 2"],
        current_page=0,
        total_pages=2,
        file_size=1024,
    )
    book2 = Book(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Test Book 2",
        content=["Page 1"],
        current_page=0,
        total_pages=1,
        file_size=512,
    )
    db_session.add(book1)
    db_session.add(book2)
    db_session.commit()

    response = authenticated_client.get("/api/v1/books")
    assert response.status_code == 200
    data = response.json()
    assert len(data["books"]) == 2


def test_upload_book_success(authenticated_client, test_user):
    """Test successful book upload"""
    pdf_content = create_test_pdf()

    response = authenticated_client.post(
        "/api/v1/books",
        files={"file": ("test_book.pdf", pdf_content, "application/pdf")},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "test_book"
    assert "id" in data
    assert "content" in data
    assert "currentPage" in data
    assert data["currentPage"] == 0


def test_upload_book_invalid_file_type(authenticated_client, test_user):
    """Test uploading non-PDF file"""
    response = authenticated_client.post(
        "/api/v1/books",
        files={"file": ("test.txt", b"Not a PDF", "text/plain")},
    )

    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_upload_book_too_large(authenticated_client, test_user):
    """Test uploading file that exceeds size limit"""
    # Create a large fake PDF content (51MB)
    large_content = b"x" * (51 * 1024 * 1024)

    response = authenticated_client.post(
        "/api/v1/books",
        files={"file": ("large.pdf", large_content, "application/pdf")},
    )

    assert response.status_code == 400
    assert "File too large" in response.json()["detail"]


def test_get_book_success(authenticated_client, db_session, test_user):
    """Test getting a specific book"""
    book_id = str(uuid.uuid4())
    book = Book(
        id=book_id,
        user_id=test_user.id,
        name="Test Book",
        content=["Page 1", "Page 2", "Page 3"],
        current_page=1,
        total_pages=3,
        file_size=2048,
    )
    db_session.add(book)
    db_session.commit()

    response = authenticated_client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == book_id
    assert data["name"] == "Test Book"
    assert data["currentPage"] == 1
    assert len(data["content"]) == 3


def test_get_book_not_found(authenticated_client, test_user):
    """Test getting a non-existent book"""
    fake_id = str(uuid.uuid4())
    response = authenticated_client.get(f"/api/v1/books/{fake_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_book_progress_success(authenticated_client, db_session, test_user):
    """Test updating book progress"""
    book_id = str(uuid.uuid4())
    book = Book(
        id=book_id,
        user_id=test_user.id,
        name="Test Book",
        content=["Page 1", "Page 2", "Page 3"],
        current_page=0,
        total_pages=3,
        file_size=1024,
    )
    db_session.add(book)
    db_session.commit()

    response = authenticated_client.patch(
        f"/api/v1/books/{book_id}",
        json={"currentPage": 2},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["currentPage"] == 2


def test_update_book_progress_invalid_page(authenticated_client, db_session, test_user):
    """Test updating book progress with invalid page number"""
    book_id = str(uuid.uuid4())
    book = Book(
        id=book_id,
        user_id=test_user.id,
        name="Test Book",
        content=["Page 1", "Page 2"],
        current_page=0,
        total_pages=2,
        file_size=1024,
    )
    db_session.add(book)
    db_session.commit()

    response = authenticated_client.patch(
        f"/api/v1/books/{book_id}",
        json={"currentPage": 5},
    )

    assert response.status_code == 400
    assert "Invalid page number" in response.json()["detail"]


def test_update_book_progress_not_found(authenticated_client, test_user):
    """Test updating progress for non-existent book"""
    fake_id = str(uuid.uuid4())
    response = authenticated_client.patch(
        f"/api/v1/books/{fake_id}",
        json={"currentPage": 1},
    )
    assert response.status_code == 404


def test_delete_book_success(authenticated_client, db_session, test_user):
    """Test deleting a book"""
    book_id = str(uuid.uuid4())
    book = Book(
        id=book_id,
        user_id=test_user.id,
        name="Test Book",
        content=["Page 1"],
        current_page=0,
        total_pages=1,
        file_size=512,
    )
    db_session.add(book)
    db_session.commit()

    response = authenticated_client.delete(f"/api/v1/books/{book_id}")
    assert response.status_code == 204

    # Verify book is deleted
    response = authenticated_client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 404


def test_delete_book_not_found(authenticated_client, test_user):
    """Test deleting a non-existent book"""
    fake_id = str(uuid.uuid4())
    response = authenticated_client.delete(f"/api/v1/books/{fake_id}")
    assert response.status_code == 404

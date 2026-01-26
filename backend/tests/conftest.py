"""Pytest configuration and fixtures for tests"""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, get_password_hash
from app.db.database import Base, get_db
from app.main import app

# Import models to ensure they are registered with Base.metadata
from app.models.book import Book
from app.models.dictionary import DictionaryWord
from app.models.settings import UserSettings
from app.models.user import User

# Use in-memory SQLite database for tests with StaticPool
# StaticPool ensures the same connection is reused, keeping the in-memory DB alive
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool to maintain single connection
)

# Test user credentials
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Set up database before each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def test_user(db_session):
    """Create a test user"""
    user = User(
        id=str(uuid.uuid4()),
        email=TEST_USER_EMAIL,
        password_hash=get_password_hash(TEST_USER_PASSWORD),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(test_user):
    """Create authorization headers for the test user"""
    token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session override"""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def authenticated_client(client, auth_headers):
    """
    Create a wrapper that automatically adds auth headers to requests.
    Use this for tests that require authentication.
    """
    original_get = client.get
    original_post = client.post
    original_patch = client.patch
    original_delete = client.delete

    def auth_get(url, **kwargs):
        headers = kwargs.pop("headers", {})
        headers.update(auth_headers)
        return original_get(url, headers=headers, **kwargs)

    def auth_post(url, **kwargs):
        headers = kwargs.pop("headers", {})
        headers.update(auth_headers)
        return original_post(url, headers=headers, **kwargs)

    def auth_patch(url, **kwargs):
        headers = kwargs.pop("headers", {})
        headers.update(auth_headers)
        return original_patch(url, headers=headers, **kwargs)

    def auth_delete(url, **kwargs):
        headers = kwargs.pop("headers", {})
        headers.update(auth_headers)
        return original_delete(url, headers=headers, **kwargs)

    client.get = auth_get
    client.post = auth_post
    client.patch = auth_patch
    client.delete = auth_delete

    return client

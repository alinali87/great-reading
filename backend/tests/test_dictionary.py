"""Tests for dictionary endpoints"""

import uuid

import pytest

from app.models.dictionary import DictionaryWord


def test_get_dictionary_empty(client):
    """Test getting dictionary when empty"""
    response = client.get("/api/v1/dictionary")
    assert response.status_code == 200
    data = response.json()
    assert "words" in data
    assert data["words"] == []
    assert data["total"] == 0
    assert data["limit"] == 100
    assert data["offset"] == 0


def test_get_dictionary_with_words(client, db_session):
    """Test getting dictionary with words"""
    word1 = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id="default-user",
        word="ephemeral",
        definition="Lasting for a very short time",
        context="The beauty was ephemeral",
    )
    word2 = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id="default-user",
        word="serendipity",
        definition="The occurrence of events by chance in a happy way",
        context=None,
    )
    db_session.add(word1)
    db_session.add(word2)
    db_session.commit()

    response = client.get("/api/v1/dictionary")
    assert response.status_code == 200
    data = response.json()
    assert len(data["words"]) == 2
    assert data["total"] == 2


def test_get_dictionary_with_pagination(client, db_session):
    """Test dictionary pagination"""
    for i in range(5):
        word = DictionaryWord(
            id=str(uuid.uuid4()),
            user_id="default-user",
            word=f"word{i}",
            definition=f"Definition {i}",
        )
        db_session.add(word)
    db_session.commit()

    # Test with limit and offset
    response = client.get("/api/v1/dictionary?limit=2&offset=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["words"]) == 2
    assert data["total"] == 5
    assert data["limit"] == 2
    assert data["offset"] == 1


def test_get_dictionary_sorted_by_word_asc(client, db_session):
    """Test dictionary sorting by word ascending"""
    words = ["zebra", "apple", "moon"]
    for w in words:
        word = DictionaryWord(
            id=str(uuid.uuid4()),
            user_id="default-user",
            word=w,
            definition=f"Definition of {w}",
        )
        db_session.add(word)
    db_session.commit()

    response = client.get("/api/v1/dictionary?sort=word_asc")
    assert response.status_code == 200
    data = response.json()
    assert data["words"][0]["word"] == "apple"
    assert data["words"][1]["word"] == "moon"
    assert data["words"][2]["word"] == "zebra"


def test_add_word_to_dictionary_success(client):
    """Test adding a word to dictionary"""
    response = client.post(
        "/api/v1/dictionary",
        json={
            "word": "Ephemeral",
            "definition": "Lasting for a very short time",
            "context": "The moment was ephemeral",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["word"] == "ephemeral"  # Should be lowercase
    assert data["definition"] == "Lasting for a very short time"
    assert data["context"] == "The moment was ephemeral"
    assert "id" in data
    assert "addedAt" in data


def test_add_word_without_context(client):
    """Test adding a word without context"""
    response = client.post(
        "/api/v1/dictionary",
        json={
            "word": "serendipity",
            "definition": "Finding something good without looking for it",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["word"] == "serendipity"
    assert data["context"] is None


def test_add_word_duplicate(client, db_session):
    """Test adding a word that already exists"""
    existing_word = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id="default-user",
        word="ephemeral",
        definition="Existing definition",
    )
    db_session.add(existing_word)
    db_session.commit()

    response = client.post(
        "/api/v1/dictionary",
        json={
            "word": "Ephemeral",  # Same word, different case
            "definition": "New definition",
        },
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_add_word_validation_empty_word(client):
    """Test adding a word with empty word field"""
    response = client.post(
        "/api/v1/dictionary",
        json={
            "word": "",
            "definition": "Some definition",
        },
    )

    assert response.status_code == 422  # Validation error


def test_add_word_validation_empty_definition(client):
    """Test adding a word with empty definition"""
    response = client.post(
        "/api/v1/dictionary",
        json={
            "word": "test",
            "definition": "",
        },
    )

    assert response.status_code == 422  # Validation error


def test_remove_word_from_dictionary_success(client, db_session):
    """Test removing a word from dictionary"""
    word_id = str(uuid.uuid4())
    word = DictionaryWord(
        id=word_id,
        user_id="default-user",
        word="ephemeral",
        definition="Test definition",
    )
    db_session.add(word)
    db_session.commit()

    response = client.delete(f"/api/v1/dictionary/{word_id}")
    assert response.status_code == 204

    # Verify word is deleted
    response = client.get("/api/v1/dictionary")
    data = response.json()
    assert len(data["words"]) == 0


def test_remove_word_not_found(client):
    """Test removing a non-existent word"""
    fake_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/dictionary/{fake_id}")
    assert response.status_code == 404


def test_check_word_exists(client, db_session):
    """Test checking if a word exists in dictionary"""
    word = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id="default-user",
        word="ephemeral",
        definition="Test definition",
    )
    db_session.add(word)
    db_session.commit()

    response = client.get("/api/v1/dictionary/check/Ephemeral")
    assert response.status_code == 200
    data = response.json()
    assert data["exists"] is True
    assert data["word"] == "ephemeral"


def test_check_word_not_exists(client):
    """Test checking if a non-existent word exists"""
    response = client.get("/api/v1/dictionary/check/nonexistent")
    assert response.status_code == 200
    data = response.json()
    assert data["exists"] is False
    assert data["word"] == "nonexistent"


def test_check_word_case_insensitive(client, db_session):
    """Test that word checking is case-insensitive"""
    word = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id="default-user",
        word="test",
        definition="Test definition",
    )
    db_session.add(word)
    db_session.commit()

    # Try different cases
    for variant in ["test", "Test", "TEST", "TeSt"]:
        response = client.get(f"/api/v1/dictionary/check/{variant}")
        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is True
        assert data["word"] == "test"

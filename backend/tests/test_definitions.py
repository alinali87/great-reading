"""Tests for definitions endpoints"""

from unittest.mock import AsyncMock, patch

import pytest

from app.schemas.dictionary import (
    WordDefinitionItem,
    WordDefinitionResponse,
    WordPronunciationResponse,
)


@pytest.fixture
def mock_definition_response():
    """Mock response from dictionary API"""
    return WordDefinitionResponse(
        word="test",
        definitions=[
            WordDefinitionItem(
                part_of_speech="noun",
                definition="A procedure for critical evaluation",
                example="The students took a test",
            ),
            WordDefinitionItem(
                part_of_speech="verb",
                definition="To take measures to check quality",
                example="They tested the new software",
            ),
        ],
        phonetic="/test/",
        audio_url="https://example.com/test.mp3",
    )


@pytest.fixture
def mock_pronunciation_response():
    """Mock pronunciation response"""
    return WordPronunciationResponse(
        word="test",
        audio_url="https://example.com/test.mp3",
        phonetic="/test/",
    )


def test_get_word_definition_success(client, mock_definition_response):
    """Test getting word definition successfully"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_definition",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_definition_response

        response = client.get("/api/v1/definitions/test")
        assert response.status_code == 200
        data = response.json()
        assert data["word"] == "test"
        assert len(data["definitions"]) == 2
        assert data["definitions"][0]["partOfSpeech"] == "noun"
        assert data["phonetic"] == "/test/"
        assert data["audioUrl"] == "https://example.com/test.mp3"


def test_get_word_definition_not_found(client):
    """Test getting definition for non-existent word"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_definition",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.side_effect = ValueError("Definition not found for the word 'xyzabc'")

        response = client.get("/api/v1/definitions/xyzabc")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


def test_get_word_definition_api_error(client):
    """Test handling API errors"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_definition",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.side_effect = ValueError("Failed to fetch definition")

        response = client.get("/api/v1/definitions/test")
        assert response.status_code == 404


def test_get_word_pronunciation_success(client, mock_pronunciation_response):
    """Test getting word pronunciation successfully"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_pronunciation",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_pronunciation_response

        response = client.get("/api/v1/definitions/test/pronounce")
        assert response.status_code == 200
        data = response.json()
        assert data["word"] == "test"
        assert data["audioUrl"] == "https://example.com/test.mp3"
        assert data["phonetic"] == "/test/"


def test_get_word_pronunciation_with_voice_param(client, mock_pronunciation_response):
    """Test getting pronunciation with voice parameter"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_pronunciation",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_pronunciation_response

        response = client.get("/api/v1/definitions/test/pronounce?voice=uk")
        assert response.status_code == 200
        mock_get.assert_called_once_with("test", "uk")


def test_get_word_pronunciation_invalid_voice(client):
    """Test getting pronunciation with invalid voice parameter"""
    response = client.get("/api/v1/definitions/test/pronounce?voice=invalid")
    assert response.status_code == 422  # Validation error


def test_get_word_pronunciation_not_available(client):
    """Test when pronunciation is not available"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_pronunciation",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.side_effect = ValueError("Pronunciation not available for 'test'")

        response = client.get("/api/v1/definitions/test/pronounce")
        assert response.status_code == 404


def test_get_word_pronunciation_default_voice(client, mock_pronunciation_response):
    """Test that default voice is 'us'"""
    with patch(
        "app.services.dictionary_service.dictionary_service.get_word_pronunciation",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_pronunciation_response

        response = client.get("/api/v1/definitions/test/pronounce")
        assert response.status_code == 200
        # Verify default voice parameter is 'us'
        mock_get.assert_called_once_with("test", "us")

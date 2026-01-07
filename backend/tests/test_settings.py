"""Tests for settings endpoints"""

import pytest

from app.models.settings import ReadingMode, UserSettings


def test_get_settings_creates_default(client):
    """Test getting settings creates default settings if not exist"""
    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == "default-user"
    assert data["timerDuration"] == 5
    assert data["readingMode"] == "page"
    assert "updatedAt" in data


def test_get_settings_existing(client, db_session):
    """Test getting existing settings"""
    settings = UserSettings(
        user_id="default-user",
        timer_duration=10,
        reading_mode=ReadingMode.SENTENCE,
    )
    db_session.add(settings)
    db_session.commit()

    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 10
    assert data["readingMode"] == "sentence"


def test_update_settings_timer_duration(client):
    """Test updating timer duration"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 15},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 15


def test_update_settings_reading_mode(client):
    """Test updating reading mode"""
    response = client.patch(
        "/api/v1/settings",
        json={"readingMode": "sentence"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["readingMode"] == "sentence"


def test_update_settings_both_fields(client):
    """Test updating both timer duration and reading mode"""
    response = client.patch(
        "/api/v1/settings",
        json={
            "timerDuration": 20,
            "readingMode": "sentence",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 20
    assert data["readingMode"] == "sentence"


def test_update_settings_creates_if_not_exists(client):
    """Test that update creates settings if they don't exist"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 25},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 25
    assert data["readingMode"] == "page"  # Default value


def test_update_settings_partial_update(client, db_session):
    """Test partial update preserves other fields"""
    settings = UserSettings(
        user_id="default-user",
        timer_duration=10,
        reading_mode=ReadingMode.SENTENCE,
    )
    db_session.add(settings)
    db_session.commit()

    # Update only timer duration
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 30},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 30
    assert data["readingMode"] == "sentence"  # Preserved


def test_update_settings_invalid_timer_duration_too_low(client):
    """Test updating timer duration below minimum"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 0},
    )

    assert response.status_code == 422  # Validation error


def test_update_settings_invalid_timer_duration_too_high(client):
    """Test updating timer duration above maximum"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 150},
    )

    assert response.status_code == 422  # Validation error


def test_update_settings_invalid_reading_mode(client):
    """Test updating with invalid reading mode"""
    response = client.patch(
        "/api/v1/settings",
        json={"readingMode": "invalid"},
    )

    assert response.status_code == 422  # Validation error


def test_update_settings_empty_payload(client, db_session):
    """Test updating with empty payload"""
    settings = UserSettings(
        user_id="default-user",
        timer_duration=10,
        reading_mode=ReadingMode.PAGE,
    )
    db_session.add(settings)
    db_session.commit()

    response = client.patch(
        "/api/v1/settings",
        json={},
    )

    assert response.status_code == 200
    data = response.json()
    # Should preserve existing values
    assert data["timerDuration"] == 10
    assert data["readingMode"] == "page"


def test_settings_timer_duration_boundary_min(client):
    """Test timer duration at minimum boundary (1)"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 1},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 1


def test_settings_timer_duration_boundary_max(client):
    """Test timer duration at maximum boundary (120)"""
    response = client.patch(
        "/api/v1/settings",
        json={"timerDuration": 120},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["timerDuration"] == 120

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "GreatReading API"
    VERSION: str = "1.0.0"

    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./greatreading.db")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:8080", "http://localhost:3000"]
    )

    # File Upload
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = Field(default="./uploads")

    # External APIs
    DICTIONARY_API_URL: str = Field(
        default="https://api.dictionaryapi.dev/api/v2/entries/en"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

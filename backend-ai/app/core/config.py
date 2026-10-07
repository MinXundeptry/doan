from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_AI_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-3.8-flash"
    gemini_fallback_model: str = "gemini-flash-latest,gemini-3.1-flash-lite"

    model_config = SettingsConfigDict(
        env_file=BACKEND_AI_DIR / ".env",
        extra="ignore",
    )


settings = Settings()
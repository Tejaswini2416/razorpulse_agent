from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RazorPulse"
    environment: str = "development"
    groq_api_key: str = "demo-key"
    groq_model: str = "llama-3.3-70b-versatile"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    sqlite_database_url: str = "sqlite+aiosqlite:///./razorpulse.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

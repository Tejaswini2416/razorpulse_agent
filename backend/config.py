# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    groq_api_key: str = "mock-groq-key" # Default or placeholder
    database_url: str = "sqlite+aiosqlite:///./razorpulse.db"
    
    # Optional OpenAI or other fallbacks if needed, but primary is Groq
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "continuum_engine"
    APP_VERSION: str = "1.0.1"  # Current active production version

    # Security Settings
    JWT_SECRET: str = "super-secret-key-change-in-production-12345"
    JWT_ALGORITHM: str = "HS256"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "password123"
    ENCRYPTION_KEY: str = "G8kP9zR2wY7xQ5vS1tN4mK3jL6hF0gA3"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ancient Chinese Texts API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ancient_texts"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    class Config:
        env_file = ".env"

settings = Settings()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ancient Chinese Texts API"
    MONGODB_URL: str = "mongodb://localhost:27017/ancient_texts"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DEEPSEEK_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()

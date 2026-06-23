from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ancient Chinese Texts API"
    MYSQL_URL: str = "mysql+pymysql://root:xh050316@localhost:3306/ancient_texts"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    class Config:
        env_file = ".env"

settings = Settings()

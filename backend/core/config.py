from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ancient Chinese Texts API"
    # 暂定使用 SQLite 本地数据库，方便开发。后期可替换为 postgresql://user:password@localhost/dbname
    DATABASE_URL: str = "sqlite:///./ancient_texts.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

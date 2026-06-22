from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# 因为使用 SQLite，需要添加 check_same_thread=False
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 数据库依赖项，供 FastAPI 路由使用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

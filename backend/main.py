from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.config import settings
from api import auth, ai_assistant
from fastapi.middleware.cors import CORSMiddleware
from db.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Ancient Chinese Texts Smart Platform",
    version="1.0.0",
    lifespan=lifespan
)

# 配置 CORS，允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # 前端开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载路由
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai_assistant"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Ancient Chinese Texts Smart Platform API"}

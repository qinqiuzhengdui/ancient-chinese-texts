from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from core.config import settings
import redis.asyncio as redis

# MongoDB client
client = AsyncIOMotorClient(settings.MONGODB_URL)

async def init_db():
    from models.user import User
    from models.note import Note
    from models.skill import Skill
    
    await init_beanie(
        database=client.get_default_database(),
        document_models=[
            User,
            Note,
            Skill
        ]
    )

# Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

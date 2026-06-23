import motor.motor_asyncio
from beanie import init_beanie
from core.config import settings
from models.user import User

async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[User]
    )

from beanie import Document, Indexed
from datetime import datetime
from pydantic import Field

class Note(Document):
    user_id: Indexed(str)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notes"

from beanie import Document, Indexed
from datetime import datetime
from pydantic import Field
from typing import List

class Note(Document):
    user_id: Indexed(str)
    content: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notes"

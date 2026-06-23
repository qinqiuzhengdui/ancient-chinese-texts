from beanie import Document, Indexed
from datetime import datetime
from pydantic import Field
from typing import Optional

class Skill(Document):
    user_id: Indexed(str)
    name: str
    source_url: Optional[str] = None
    local_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "skills"

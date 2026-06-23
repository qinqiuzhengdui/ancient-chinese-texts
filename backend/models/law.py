from datetime import datetime
from typing import List, Optional
from beanie import Document
from pydantic import BaseModel, Field

class LawNode(BaseModel):
    level: str
    prefix: str
    content: str
    children: Optional[List['LawNode']] = Field(default_factory=list)

class Law(Document):
    title: str
    nodes: List[LawNode] = Field(default_factory=list)
    raw_text: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "laws"

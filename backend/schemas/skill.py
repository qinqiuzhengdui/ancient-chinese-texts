from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

class SkillBase(BaseModel):
    name: str
    source_url: Optional[str] = None
    local_path: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: PydanticObjectId
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ImportSkillRequest(BaseModel):
    url: str

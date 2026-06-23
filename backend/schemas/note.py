from pydantic import BaseModel
from datetime import datetime
from beanie import PydanticObjectId

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: PydanticObjectId
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

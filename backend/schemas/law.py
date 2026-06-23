from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

class LawNodeSchema(BaseModel):
    level: str
    prefix: str
    content: str
    children: Optional[List['LawNodeSchema']] = []

class LawCreate(BaseModel):
    title: str
    raw_text: str

class LawUpdate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None

class LawListResponse(BaseModel):
    id: PydanticObjectId
    title: str
    created_at: datetime
    updated_at: datetime

class LawResponse(BaseModel):
    id: PydanticObjectId
    title: str
    nodes: List[LawNodeSchema]
    raw_text: str
    created_at: datetime
    updated_at: datetime

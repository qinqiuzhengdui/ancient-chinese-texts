from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to return to client
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

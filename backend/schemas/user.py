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

# Properties to receive via API on update (Personal Center)
class UserUpdate(BaseModel):
    username: Optional[str] = None
    real_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None
    education: Optional[str] = None
    title: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    
    # Verification Codes
    phone_code: Optional[str] = None
    email_code: Optional[str] = None

# Properties to return to client
class UserResponse(UserBase):
    id: int
    real_name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None
    education: Optional[str] = None
    title: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

from beanie import Document, Indexed
from datetime import datetime
from typing import Optional

class User(Document):
    email: Indexed(str, unique=True)
    username: Indexed(str, unique=True)
    hashed_password: str
    
    # Personal Profile Fields
    real_name: Optional[str] = None
    phone: Optional[Indexed(str, unique=True)] = None
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None
    education: Optional[str] = None
    title: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"

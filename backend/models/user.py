from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Personal Profile Fields
    real_name = Column(String(255), nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    birth_date = Column(DateTime, nullable=True) # or Date
    gender = Column(String(10), nullable=True)
    education = Column(String(50), nullable=True)
    title = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

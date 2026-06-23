from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.session import Base

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=True) # Git URL if imported via git
    local_path = Column(String(500), nullable=False) # e.g. "skills/{user_id}_{name}"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

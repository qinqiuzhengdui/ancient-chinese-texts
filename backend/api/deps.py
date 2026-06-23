from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import ValidationError
from core.config import settings
from core.security import ALGORITHM
from schemas.user import TokenPayload
from models.user import User
from db.session import get_db

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_user(
    token: str = Depends(reusable_oauth2), 
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

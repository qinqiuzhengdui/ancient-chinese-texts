from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from schemas.user import UserCreate, UserResponse, Token
from models.user import User
from core.security import get_password_hash, verify_password, create_access_token
from db.session import redis_client
from beanie.operators import Or

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    # 1. Verify Phone Code
    stored_phone_code = await redis_client.get(f"verify_code_{user_in.phone}")
    if not stored_phone_code or stored_phone_code != user_in.phone_code:
        raise HTTPException(status_code=400, detail="Invalid or expired phone verification code")
        
    # 2. Verify Email Code
    stored_email_code = await redis_client.get(f"verify_code_{user_in.email}")
    if not stored_email_code or stored_email_code != user_in.email_code:
        raise HTTPException(status_code=400, detail="Invalid or expired email verification code")

    user = await User.find_one(
        Or(
            User.email == user_in.email,
            User.username == user_in.username,
            User.phone == user_in.phone
        )
    )
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username, email, or phone already exists.",
        )
    
    user_doc = User(
        email=user_in.email,
        username=user_in.username,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
    )
    await user_doc.insert()
    
    # Clean up codes
    await redis_client.delete(f"verify_code_{user_in.phone}")
    await redis_client.delete(f"verify_code_{user_in.email}")
    
    return user_doc

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(
        Or(
            User.username == form_data.username,
            User.email == form_data.username
        )
    )
        
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

class CodeLoginRequest(BaseModel):
    login_type: str # 'phone' or 'email'
    target: str     # phone number or email address
    code: str       # verification code

@router.post("/login-code", response_model=Token)
async def login_code(login_in: CodeLoginRequest):
    # 1. Verify Code in Redis
    stored_code = await redis_client.get(f"verify_code_{login_in.target}")
    if not stored_code or stored_code != login_in.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
        
    # 2. Find User by phone/email
    if login_in.login_type == 'phone':
        user = await User.find_one(User.phone == login_in.target)
    elif login_in.login_type == 'email':
        user = await User.find_one(User.email == login_in.target)
    else:
        raise HTTPException(status_code=400, detail="Invalid login type")
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register first."
        )
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    # 3. Clean up verification code
    await redis_client.delete(f"verify_code_{login_in.target}")
    
    # 4. Generate Access Token
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

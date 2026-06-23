from fastapi import APIRouter, Depends, HTTPException, status
import random
from typing import Optional
from pydantic import BaseModel

from schemas.user import UserResponse, UserUpdate
from models.user import User
from api.deps import get_current_user
from db.session import redis_client

router = APIRouter()

class VerifyRequest(BaseModel):
    target: str

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/verify-code")
async def send_verify_code(req: VerifyRequest):
    # Generate 6 digit code
    code = f"{random.randint(100000, 999999)}"
    target = req.target
    
    # Store in redis with 5 minute expiry
    await redis_client.setex(f"verify_code_{target}", 300, code)
    
    # Simulate sending by printing to console
    print(f"=========================================")
    print(f"[{target}] Verification Code: {code}")
    print(f"=========================================")
    
    return {"msg": "Verification code sent successfully"}

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    # Verification logic for phone
    if user_in.phone and user_in.phone != current_user.phone:
        if not user_in.phone_code:
            raise HTTPException(status_code=400, detail="Phone verification code is required")
        
        stored_code = await redis_client.get(f"verify_code_{user_in.phone}")
        if not stored_code or stored_code != user_in.phone_code:
            raise HTTPException(status_code=400, detail="Invalid or expired phone verification code")
        
        # Optionally delete code after use
        await redis_client.delete(f"verify_code_{user_in.phone}")

    # Verification logic for email
    if user_in.email and user_in.email != current_user.email:
        if not user_in.email_code:
            raise HTTPException(status_code=400, detail="Email verification code is required")
            
        stored_code = await redis_client.get(f"verify_code_{user_in.email}")
        if not stored_code or stored_code != user_in.email_code:
            raise HTTPException(status_code=400, detail="Invalid or expired email verification code")
            
        # Optionally delete code after use
        await redis_client.delete(f"verify_code_{user_in.email}")

    # Update fields
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Remove verification codes from update data
    update_data.pop("phone_code", None)
    update_data.pop("email_code", None)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    await current_user.save()
    
    return current_user

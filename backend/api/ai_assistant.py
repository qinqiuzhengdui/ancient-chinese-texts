from fastapi import APIRouter

router = APIRouter()

@router.post("/chat")
def chat(message: str):
    return {"response": f"AI Assistant received: {message} (Placeholder)"}

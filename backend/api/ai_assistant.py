from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from openai import AsyncOpenAI
from core.config import settings

router = APIRouter()

# Initialize DeepSeek client
# DeepSeek API is fully compatible with OpenAI SDK
client = AsyncOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

SYSTEM_PROMPT = """你是一个精通中华古籍文献的智能专家助手。
你的任务是协助用户进行文言文翻译、句读断句、古籍背景知识解答、历史人物考究等。
你的语气应当专业、儒雅、耐心。在翻译文言文时，应力求信、达、雅。在做句读时，请使用现代标准标点符号。
请直接回答用户的问题，不要使用过多废话。"""

@router.post("/chat")
async def chat(request: ChatRequest):
    if not settings.DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API key is not configured.")
        
    try:
        # Prepare messages array with system prompt
        api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})
            
        # Call DeepSeek API
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=api_messages,
            temperature=0.7,
            max_tokens=2048
        )
        
        reply_content = response.choices[0].message.content
        return {"response": reply_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from openai import AsyncOpenAI
from core.config import settings
import json

router = APIRouter()

# Initialize DeepSeek client
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
            
        async def generate():
            try:
                response = await client.chat.completions.create(
                    model="deepseek-chat",
                    messages=api_messages,
                    temperature=0.7,
                    max_tokens=2048,
                    stream=True
                )
                
                async for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content is not None:
                        # Server-Sent Events (SSE) format
                        yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

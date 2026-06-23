from fastapi import APIRouter, Depends
from typing import List, Dict, Any
import json

from schemas.note import NoteCreate, NoteResponse
from models.note import Note
from models.user import User
from api.deps import get_current_user
from core.config import settings
from openai import AsyncOpenAI

router = APIRouter()

client = AsyncOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

async def extract_tags(content: str) -> List[str]:
    if not settings.DEEPSEEK_API_KEY:
        return []
        
    prompt = f"""请阅读以下随笔内容，并提取出 1 到 4 个最相关的标签（Tags）。
标签应该简短（通常不超过 5 个字）。
请严格按照 JSON 数组格式返回，不要有 markdown 代码块，也不要有任何前缀或后缀。示例：["历史", "文学"]。

随笔内容：
{content}
"""
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        result_text = response.choices[0].message.content.strip()
        # Clean up possible markdown code blocks
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        tags = json.loads(result_text.strip())
        if isinstance(tags, list):
            return [str(t) for t in tags[:4]]
        return []
    except Exception as e:
        print(f"Error extracting tags: {e}")
        return []

@router.post("/", response_model=NoteResponse)
async def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user)
):
    # Extract tags automatically
    tags = await extract_tags(note_in.content)
    
    note = Note(
        user_id=str(current_user.id),
        content=note_in.content,
        tags=tags
    )
    await note.insert()
    return note

@router.get("/my", response_model=List[NoteResponse])
async def get_my_notes(
    current_user: User = Depends(get_current_user)
):
    notes = await Note.find(Note.user_id == str(current_user.id)).sort("-created_at").to_list()
    return notes

@router.get("/graph")
async def get_knowledge_graph(current_user: User = Depends(get_current_user)):
    notes = await Note.find(Note.user_id == str(current_user.id)).to_list()
    
    nodes = []
    links = []
    tag_set = set()
    
    for note in notes:
        # Note node
        note_name = note.content[:15].replace('\n', ' ') + "..." if len(note.content) > 15 else note.content.replace('\n', ' ')
        nodes.append({
            "id": str(note.id),
            "name": note_name,
            "group": "note"
        })
        
        # Tags and Links
        for tag in note.tags:
            tag_id = f"tag_{tag}"
            if tag_id not in tag_set:
                tag_set.add(tag_id)
                nodes.append({
                    "id": tag_id,
                    "name": tag,
                    "group": "tag"
                })
            links.append({
                "source": str(note.id),
                "target": tag_id
            })
            
    return {"nodes": nodes, "links": links}

from fastapi import APIRouter, Depends
from typing import List

from schemas.note import NoteCreate, NoteResponse
from models.note import Note
from models.user import User
from api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=NoteResponse)
async def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user)
):
    note = Note(
        user_id=str(current_user.id),
        content=note_in.content
    )
    await note.insert()
    return note

@router.get("/my", response_model=List[NoteResponse])
async def get_my_notes(
    current_user: User = Depends(get_current_user)
):
    notes = await Note.find(Note.user_id == str(current_user.id)).sort("-created_at").to_list()
    return notes

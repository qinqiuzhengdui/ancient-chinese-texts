from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from schemas.note import NoteCreate, NoteResponse
from models.note import Note
from models.user import User
from api.deps import get_current_user
from db.session import get_db

router = APIRouter()

@router.post("/", response_model=NoteResponse)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = Note(
        user_id=current_user.id,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/my", response_model=List[NoteResponse])
def get_my_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notes = db.query(Note).filter(Note.user_id == current_user.id).order_by(Note.created_at.desc()).all()
    return notes

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from models.law import Law
from models.user import User
from schemas.law import LawResponse, LawListResponse, LawCreate, LawUpdate
from api.deps import get_current_user
from core.law_parser import parse_law_text
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/", response_model=List[LawListResponse])
async def get_laws():
    laws = await Law.find_all().sort("-created_at").to_list()
    return laws

@router.get("/{law_id}", response_model=LawResponse)
async def get_law(law_id: PydanticObjectId):
    law = await Law.get(law_id)
    if not law:
        raise HTTPException(status_code=404, detail="Law not found")
    return law

@router.post("/", response_model=LawResponse)
async def create_law(
    req: LawCreate,
    current_user: User = Depends(get_current_user)
):
    nodes = parse_law_text(req.raw_text)
    law = Law(
        title=req.title,
        nodes=nodes,
        raw_text=req.raw_text
    )
    await law.insert()
    return law

@router.put("/{law_id}", response_model=LawResponse)
async def update_law(
    law_id: PydanticObjectId,
    req: LawUpdate,
    current_user: User = Depends(get_current_user)
):
    law = await Law.get(law_id)
    if not law:
        raise HTTPException(status_code=404, detail="Law not found")
        
    if req.title is not None:
        law.title = req.title
    if req.raw_text is not None:
        law.raw_text = req.raw_text
        law.nodes = parse_law_text(req.raw_text)
        
    await law.save()
    return law

@router.delete("/{law_id}")
async def delete_law(
    law_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    law = await Law.get(law_id)
    if not law:
        raise HTTPException(status_code=404, detail="Law not found")
    await law.delete()
    return {"message": "Deleted successfully"}

@router.post("/import", response_model=LawResponse)
async def import_law_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported for import")
        
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("gbk")
        except:
            raise HTTPException(status_code=400, detail="Only UTF-8 or GBK text files are supported.")
    
    title = file.filename.replace(".txt", "")
    nodes = parse_law_text(text)
    
    law = Law(
        title=title,
        nodes=nodes,
        raw_text=text
    )
    await law.insert()
    return law

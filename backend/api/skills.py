from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import subprocess
import shutil
import zipfile
import time

from schemas.skill import SkillResponse, ImportSkillRequest
from models.skill import Skill
from models.user import User
from api.deps import get_current_user
from db.session import get_db

router = APIRouter()

# Base skills directory at project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
SKILLS_DIR = os.path.join(PROJECT_ROOT, "skills")

if not os.path.exists(SKILLS_DIR):
    os.makedirs(SKILLS_DIR)

@router.get("/my", response_model=List[SkillResponse])
def get_my_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).order_by(Skill.created_at.desc()).all()
    return skills

@router.post("/import", response_model=SkillResponse)
def import_skill_git(
    req: ImportSkillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    url = req.url
    # extract project name from git url
    # e.g., https://github.com/user/repo.git -> repo
    skill_name = url.split("/")[-1].replace(".git", "")
    if not skill_name:
        skill_name = f"skill_{int(time.time())}"
        
    local_path = f"{current_user.id}_{skill_name}"
    target_dir = os.path.join(SKILLS_DIR, local_path)
    
    if os.path.exists(target_dir):
        raise HTTPException(status_code=400, detail="Skill directory already exists. Please rename or delete it first.")
        
    try:
        # Clone repo
        subprocess.run(["git", "clone", url, target_dir], check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Failed to clone repository: {e.stderr}")
        
    # Save to db
    skill = Skill(
        user_id=current_user.id,
        name=skill_name,
        source_url=url,
        local_path=local_path
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

@router.post("/upload", response_model=SkillResponse)
async def upload_skill_zip(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")
        
    skill_name = file.filename.replace('.zip', '')
    local_path = f"{current_user.id}_{skill_name}_{int(time.time())}"
    target_dir = os.path.join(SKILLS_DIR, local_path)
    
    os.makedirs(target_dir, exist_ok=True)
    temp_zip_path = os.path.join(target_dir, file.filename)
    
    try:
        # Save zip
        with open(temp_zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract zip
        with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_dir)
            
        # Remove zip file
        os.remove(temp_zip_path)
        
    except Exception as e:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=f"Failed to process zip file: {str(e)}")
        
    # Save to db
    skill = Skill(
        user_id=current_user.id,
        name=skill_name,
        source_url=None,
        local_path=local_path
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

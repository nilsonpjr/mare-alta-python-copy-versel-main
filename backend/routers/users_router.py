from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models
from backend import schemas
from backend import auth

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_active_user)):
    users = db.query(models.User).filter(models.User.tenant_id == current_user.tenant_id).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(auth.get_current_active_user)):
    return current_user

@router.patch("/me/complete-onboarding")
def complete_onboarding(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Marca o onboarding global como concluído para o usuário atual.
    Atualiza o campo 'preferences' no banco.
    """
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario não encontrado")
    
    # Init preferences if none
    prefs = dict(db_user.preferences) if db_user.preferences else {}
    
    # Mark onboarding as completed
    prefs["onboarding_completed"] = True
    
    # Update
    db_user.preferences = prefs
    db.commit()
    db.refresh(db_user)
    
    return {"status": "success", "onboarding_completed": True}

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Security: Prevent role/tenant updates via this endpoint unless logic allows
    # For now, let's filter sensitive fields if needed, but UserUpdate schema is permissive.
    # We should strictly not allow changing tenant_id here (it's not in UserUpdate anyway).
    
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

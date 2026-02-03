"""
Router de API para gerenciamento de parceiros (Fase 3).
Endpoints para cadastro, consulta, atualização e avaliação de parceiros.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from backend import schemas
from backend import crud
from backend.database import get_db
from backend import integrations

router = APIRouter(prefix="/api/partners", tags=["Parceiros"])

# --- PARTNERS ---

@router.get("", response_model=List[schemas.Partner])
def list_partners(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Lista todos os parceiros do tenant.
    """
    return crud.get_partners(db, tenant_id=current_user.tenant_id, active_only=active_only)

@router.get("/{partner_id}", response_model=schemas.Partner)
def get_single_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Retorna um parceiro específico.
    """
    partner = crud.get_partner(db, partner_id=partner_id)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    return partner

@router.post("", response_model=schemas.Partner)
def create_new_partner(
    partner: schemas.PartnerCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Cria um novo parceiro.
    """
    new_partner = crud.create_partner(db=db, partner=partner, tenant_id=current_user.tenant_id)
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        partner_data = schemas.Partner.model_validate(new_partner).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "partner_created", partner_data)
        
    return new_partner

@router.put("/{partner_id}", response_model=schemas.Partner)
def update_existing_partner(
    partner_id: int,
    partner_update: schemas.PartnerUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Atualiza um parceiro existente.
    """
    updated_partner = crud.update_partner(db, partner_id=partner_id, partner_update=partner_update)
    if not updated_partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    return updated_partner

@router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Deleta um parceiro.
    """
    success = crud.delete_partner(db, partner_id=partner_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    return None

@router.put("/{partner_id}/rate", response_model=schemas.Partner)
def rate_existing_partner(
    partner_id: int,
    rating: float,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Avalia um parceiro (0-5 estrelas).
    """
    if rating < 0 or rating > 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating deve estar entre 0 e 5")
    
    updated_partner = crud.rate_partner(db, partner_id=partner_id, new_rating=rating)
    if not updated_partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    return updated_partner


# --- TECHNICAL INSPECTIONS ---

@router.get("/inspections", response_model=List[schemas.TechnicalInspection])
def list_inspections(
    boat_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: schemas.User =  Depends(auth.get_current_active_user)
):
    """
    Lista inspeções técnicas.
    """
    return crud.get_inspections(db, tenant_id=current_user.tenant_id, boat_id=boat_id)

@router.post("/inspections", response_model=schemas.TechnicalInspection)
def create_new_inspection(
    inspection: schemas.TechnicalInspectionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Cria uma nova inspeção técnica.
    """
    new_insp = crud.create_inspection(db=db, inspection=inspection, tenant_id=current_user.tenant_id)
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        insp_data = schemas.TechnicalInspection.model_validate(new_insp).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "inspection_created", insp_data)
        
    return new_insp

@router.put("/inspections/{inspection_id}", response_model=schemas.TechnicalInspection)
def update_existing_inspection(
    inspection_id: int,
    inspection_update: schemas.TechnicalInspectionUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Atualiza uma inspeção.
    """
    updated_inspection = crud.update_inspection(db, inspection_id=inspection_id, inspection_update=inspection_update)
    if not updated_inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspeção não encontrada")
    return updated_inspection

@router.post("/inspections/{inspection_id}/checklist", response_model=schemas.InspectionChecklistItem)
def add_checklist_item_to_inspection(
    inspection_id: int,
    item: schemas.InspectionChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Adiciona item ao checklist de uma inspeção.
    """
    return crud.add_checklist_item(db=db, inspection_id=inspection_id, item=item)


# --- PARTNER QUOTES ---

@router.get("/quotes", response_model=List[schemas.PartnerQuote])
def list_partner_quotes(
    inspection_id: Optional[int] = None,
    partner_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Lista orçamentos de parceiros.
    """
    return crud.get_partner_quotes(db, tenant_id=current_user.tenant_id, inspection_id=inspection_id, partner_id=partner_id)

@router.post("/quotes", response_model=schemas.PartnerQuote)
def create_new_quote(
    quote: schemas.PartnerQuoteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Solicita orçamento a um parceiro.
    """
    new_quote = crud.create_partner_quote(db=db, quote=quote, tenant_id=current_user.tenant_id)
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        quote_data = schemas.PartnerQuote.model_validate(new_quote).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "partner_quote_requested", quote_data)
        
    return new_quote

@router.put("/quotes/{quote_id}", response_model=schemas.PartnerQuote)
def update_existing_quote(
    quote_id: int,
    quote_update: schemas.PartnerQuoteUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Atualiza um orçamento (resposta do parceiro ou interna).
    """
    updated_quote = crud.update_partner_quote(db, quote_id=quote_id, quote_update=quote_update)
    if not updated_quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orçamento não encontrado")
        
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        quote_data = schemas.PartnerQuote.model_validate(updated_quote).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "partner_quote_updated", quote_data)
        
    return updated_quote

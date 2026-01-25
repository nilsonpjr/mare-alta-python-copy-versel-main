from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend import models, schemas

# --- PARTNER CRUD ---
# Funções para operações CRUD na tabela de parceiros.

def get_partners(db: Session, tenant_id: int, active_only: bool = False):
    """
    Retorna todos os parceiros de um tenant.
    """
    query = db.query(models.Partner).filter(models.Partner.tenant_id == tenant_id)
    if active_only:
        query = query.filter(models.Partner.active == True)
    return query.order_by(models.Partner.name).all()

def get_partner(db: Session, partner_id: int):
    """
    Retorna um parceiro pelo ID.
    """
    return db.query(models.Partner).filter(models.Partner.id == partner_id).first()

def create_partner(db: Session, partner: schemas.PartnerCreate, tenant_id: int):
    """
    Cria um novo parceiro.
    """
    db_partner = models.Partner(**partner.model_dump(), tenant_id=tenant_id)
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)
    return db_partner

def update_partner(db: Session, partner_id: int, partner_update: schemas.PartnerUpdate):
    """
    Atualiza um parceiro.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return None
    
    update_data = partner_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_partner, key, value)
    
    db.commit()
    db.refresh(db_partner)
    return db_partner

def delete_partner(db: Session, partner_id: int):
    """
    Deleta um parceiro.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return False
    
    db.delete(db_partner)
    db.commit()
    return True

def rate_partner(db: Session, partner_id: int, new_rating: float):
    """
    Atualiza a avaliação de um parceiro.
    Calcula a média ponderada com avaliações anteriores.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return None
    
    # Calcula nova média
    total_ratings = db_partner.total_jobs
    if total_ratings == 0:
        db_partner.rating = new_rating
    else:
        current_total = db_partner.rating * total_ratings
        db_partner.rating = (current_total + new_rating) / (total_ratings + 1)
    
    db_partner.total_jobs += 1
    db.commit()
    db.refresh(db_partner)
    return db_partner


# --- TECHNICAL INSPECTION CRUD ---

def get_inspections(db: Session, tenant_id: int, boat_id: int = None):
    """
    Retorna inspeções de um tenant, opcionalmente filtradas por boat_id.
    """
    query = db.query(models.TechnicalInspection).filter(models.TechnicalInspection.tenant_id == tenant_id)
    if boat_id:
        query = query.filter(models.TechnicalInspection.boat_id == boat_id)
    return query.order_by(models.TechnicalInspection.created_at.desc()).all()

def get_inspection(db: Session, inspection_id: int):
    """
    Retorna uma inspeção pelo ID.
    """
    return db.query(models.TechnicalInspection).filter(models.TechnicalInspection.id == inspection_id).first()

def create_inspection(db: Session, inspection: schemas.TechnicalInspectionCreate, tenant_id: int):
    """
    Cria uma nova inspeção técnica.
    """
    db_inspection = models.TechnicalInspection(**inspection.model_dump(), tenant_id=tenant_id)
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

def update_inspection(db: Session, inspection_id: int, inspection_update: schemas.TechnicalInspectionUpdate):
    """
    Atualiza uma inspeção.
    """
    db_inspection = get_inspection(db, inspection_id)
    if not db_inspection:
        return None
    
    update_data = inspection_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_inspection, key, value)
    
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

def add_checklist_item(db: Session, inspection_id: int, item: schemas.InspectionChecklistItemCreate):
    """
    Adiciona um item ao checklist de uma inspeção.
    """
    db_item = models.InspectionChecklistItem(**item.model_dump(), inspection_id=inspection_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# --- PARTNER QUOTE CRUD ---

def get_partner_quotes(db: Session, tenant_id: int, inspection_id: int = None, partner_id: int = None):
    """
    Retorna orçamentos, opcionalmente filtrados por inspeção ou parceiro.
    """
    query = db.query(models.PartnerQuote).filter(models.PartnerQuote.tenant_id == tenant_id)
    if inspection_id:
        query = query.filter(models.PartnerQuote.inspection_id == inspection_id)
    if partner_id:
        query = query.filter(models.PartnerQuote.partner_id == partner_id)
    return query.order_by(models.PartnerQuote.created_at.desc()).all()

def get_partner_quote(db: Session, quote_id: int):
    """
    Retorna um orçamento pelo ID.
    """
    return db.query(models.PartnerQuote).filter(models.PartnerQuote.id == quote_id).first()

def create_partner_quote(db: Session, quote: schemas.PartnerQuoteCreate, tenant_id: int):
    """
    Cria uma solicitação de orçamento para um parceiro.
    """
    db_quote = models.PartnerQuote(**quote.model_dump(), tenant_id=tenant_id)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

def update_partner_quote(db: Session, quote_id: int, quote_update: schemas.PartnerQuoteUpdate):
    """
    Atualiza um orçamento (resposta do parceiro ou atualização interna).
    """
    db_quote = get_partner_quote(db, quote_id)
    if not db_quote:
        return None
    
    update_data = quote_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_quote, key, value)
    
    # Se foi respondido, atualiza data
    if quote_update.quoted_value and not db_quote.response_date:
        db_quote.response_date = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_quote)
    return db_quote


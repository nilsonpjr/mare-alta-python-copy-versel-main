from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from backend.database import get_db
from backend import models
from backend import auth

# Router prefix set in main.py, e.g., /api/admin
router = APIRouter(prefix="/api/admin", tags=["Super Admin"])

# --- Schemas para o painel de Super Admin ---
class TenantCreate(BaseModel):
    name: str # Nome do Tenant (Empresa)
    subdomain: str
    plan: str # 'START', 'PRO', 'ENTERPRISE'
    admin_name: str
    admin_email: str
    admin_password: str

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    subdomain: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None

class TenantResponse(BaseModel):
    id: int
    name: str
    subdomain: Optional[str]
    plan: str
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Dependência de Super Admin ---
# Idealmente, você teria uma flag is_superuser no modelo de usuário ou um tenant 'master'.
# Simplificação: Apenas um email específico pode acessar.
def get_current_superuser(current_user: models.User = Depends(auth.get_current_active_user)):
    # Lista de emails de superadmins
    SUPER_ADMIN_EMAILS = ["nilsonpjr@gmail.com", "admin@viverdinautica.com"]
    
    print(f"DEBUG: Checking SuperUser access for: {current_user.email}")
    
    if current_user.email not in SUPER_ADMIN_EMAILS:
        print(f"DEBUG: Access DENIED for {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a Super Administradores"
        )
    return current_user

# --- Rotas CRUD para Tenants (Clientes SaaS) ---

@router.get("/tenants", response_model=List[TenantResponse])
def get_all_tenants(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_superuser)
):
    """Lista todos os clientes SaaS (Tenants)."""
    tenants = db.query(models.Tenant).all()
    return tenants

@router.post("/tenants", response_model=TenantResponse)
def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_superuser)
):
    """Cria um novo cliente SaaS manualmente."""
    # Verificar duplicidade
    existing = db.query(models.Tenant).filter(models.Tenant.subdomain == tenant_data.subdomain).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subdomínio já existe")

    # 1. Criar Tenant
    new_tenant = models.Tenant(
        name=tenant_data.name,
        subdomain=tenant_data.subdomain,
        plan=tenant_data.plan,
        is_active=True
    )
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)

    # 2. Criar Usuário Admin para esse Tenant
    new_user = models.User(
        tenant_id=new_tenant.id,
        name=tenant_data.admin_name,
        email=tenant_data.admin_email,
        hashed_password=auth.get_password_hash(tenant_data.admin_password),
        role=models.UserRole.ADMIN
    )
    db.add(new_user)
    db.commit()

    return new_tenant

@router.put("/tenants/{tenant_id}", response_model=TenantResponse)
def update_tenant(
    tenant_id: int,
    tenant_update: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_superuser)
):
    """Atualiza o plano ou status de um cliente SaaS."""
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    
    update_data = tenant_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tenant, key, value)
    
    db.commit()
    db.refresh(tenant)
    return tenant

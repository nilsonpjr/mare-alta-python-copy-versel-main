"""
Este módulo define as rotas da API para gerenciamento de configurações da aplicação,
incluindo fabricantes, modelos e informações da empresa.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
import schemas
import crud
import auth
from database import get_db # Função de dependência para obter a sessão do banco de dados.

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(prefix="/api/config", tags=["Configuração"])

# --- MANUFACTURERS (Fabricantes) ---
# Endpoints para gerenciar fabricantes de embarcações e motores.

@router.get("/manufacturers", response_model=List[schemas.Manufacturer])
def get_all_manufacturers(
    type: Optional[str] = None, # Parâmetro de query opcional para filtrar fabricantes por tipo ("BOAT" ou "ENGINE").
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna uma lista de todos os fabricantes, opcionalmente filtrados por tipo.
    Requer autenticação.
    """
    # Chama a função CRUD para obter os fabricantes do banco de dados.
    return crud.get_manufacturers(db, tenant_id=current_user.tenant_id, type=type)

@router.post("/manufacturers", response_model=schemas.Manufacturer)
def create_new_manufacturer(
    manufacturer: schemas.ManufacturerCreate, # Dados do novo fabricante para criação.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria um novo fabricante no sistema.
    Requer autenticação.
    """
    # Chama a função CRUD para criar o fabricante no banco de dados.
    return crud.create_manufacturer(db, manufacturer, tenant_id=current_user.tenant_id)

@router.delete("/manufacturers/{id}")
def delete_existing_manufacturer(
    id: int, # ID do fabricante a ser deletado, passado como parâmetro de caminho.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Deleta um fabricante existente pelo seu ID.
    Requer autenticação.
    Levanta um HTTPException 404 se o fabricante não for encontrado.
    """
    # Chama a função CRUD para deletar o fabricante.
    result = crud.delete_manufacturer(db, id)
    if not result:
        # Se a função CRUD retornar None, o fabricante não foi encontrado.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fabricante não encontrado")
    return {"status": "success", "message": "Fabricante deletado com sucesso"}

# --- MODELS (Modelos) ---
# Endpoints para gerenciar modelos associados a fabricantes.

@router.post("/manufacturers/{id}/models", response_model=schemas.Model)
def create_new_model(
    id: int, # ID do fabricante ao qual o modelo será associado.
    model: schemas.ModelCreate, # Dados do novo modelo para criação.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria um novo modelo e o associa a um fabricante existente.
    Requer autenticação.
    """
    # Chama a função CRUD para criar o modelo no banco de dados.
    return crud.create_model(db, id, model)

@router.delete("/models/{id}")
def delete_existing_model(
    id: int, # ID do modelo a ser deletado, passado como parâmetro de caminho.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Deleta um modelo existente pelo seu ID.
    Requer autenticação.
    Levanta um HTTPException 404 se o modelo não for encontrado.
    """
    # Chama a função CRUD para deletar o modelo.
    result = crud.delete_model(db, id)
    if not result:
        # Se a função CRUD retornar None, o modelo não foi encontrado.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modelo não encontrado")
    return {"status": "success", "message": "Modelo deletado com sucesso"}

# --- COMPANY INFO (Informações da Empresa) ---
# Endpoints para gerenciar as informações da própria empresa.

@router.get("/company", response_model=Optional[schemas.CompanyInfo])
def get_company_information(
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna as informações da empresa.
    Requer autenticação.
    """
    # Chama a função CRUD para obter as informações da empresa.
    return crud.get_company_info(db, tenant_id=current_user.tenant_id)

@router.put("/company", response_model=schemas.CompanyInfo)
def update_company_information(
    info: schemas.CompanyInfoCreate, # Dados de atualização para as informações da empresa.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Atualiza as informações da empresa. Se não existirem, uma nova entrada é criada.
    Requer autenticação.
    """
    try:
        print(f"DEBUG: Updating company info with: {info} for tenant {current_user.tenant_id}")
        # Chama a função CRUD para atualizar ou criar as informações da empresa.
        return crud.update_company_info(db, info, tenant_id=current_user.tenant_id)
    except Exception as e:
        print(f"ERROR in update_company_information: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno: {str(e)}")

# --- MAINTENANCE KITS ---

@router.get("/maintenance-kits", response_model=List[schemas.MaintenanceKit])
def get_maintenance_kits(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Retorna todos os kits de manutenção cadastrados.
    """
    return crud.get_maintenance_kits(db, tenant_id=current_user.tenant_id)

@router.post("/maintenance-kits", response_model=schemas.MaintenanceKit)
def create_maintenance_kit(
    kit: schemas.MaintenanceKitCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Cria um novo kit de manutenção.
    """
    return crud.create_maintenance_kit(db, kit, tenant_id=current_user.tenant_id)

@router.delete("/maintenance-kits/{id}")
def delete_maintenance_kit(
    id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Remove um kit de manutenção.
    """
    result = crud.delete_maintenance_kit(db, id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kit não encontrado")
    return {"status": "success", "message": "Kit deletado com sucesso"}

# --- MARINAS ---
# Endpoints para gerenciamento de marinas.

@router.get("/marinas", response_model=List[schemas.Marina])
def get_all_marinas(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Retorna a lista de marinas cadastradas.
    """
    return crud.get_marinas(db, tenant_id=current_user.tenant_id)

@router.post("/marinas", response_model=schemas.Marina)
def create_new_marina(
    marina: schemas.MarinaCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Cadastra uma nova marina.
    """
    return crud.create_marina(db, marina, tenant_id=current_user.tenant_id)

@router.put("/marinas/{id}", response_model=schemas.Marina)
def update_existing_marina(
    id: int,
    marina: schemas.MarinaCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Atualiza uma marina existente.
    """
    db_marina = crud.update_marina(db, marina_id=id, marina_update=marina)
    if not db_marina:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marina não encontrada")
    return db_marina

@router.delete("/marinas/{id}")
def delete_existing_marina(
    id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Remove uma marina.
    """
    result = crud.delete_marina(db, marina_id=id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marina não encontrada")
    return {"status": "success", "message": "Marina deletada com sucesso"}

# --- SUBSCRIPTION ---

@router.get("/subscription", response_model=schemas.ApiSubscription)
def get_subscription_details(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Retorna os detalhes do plano atual do tenant.
    """
    return crud.get_tenant_subscription(db, tenant_id=current_user.tenant_id)

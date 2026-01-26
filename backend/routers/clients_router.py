"""
Este módulo define as rotas da API para gerenciamento de clientes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
from backend import schemas
from backend import crud
from backend import auth
from backend import integrations
from backend.database import get_db # Função de dependência para obter a sessão do banco de dados.

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(prefix="/api/clients", tags=["Clientes"])

@router.get("", response_model=List[schemas.Client])
def get_all_clients(
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna uma lista de todos os clientes.
    Requer autenticação.
    """
    # Chama a função CRUD para obter os clientes do banco de dados.
    return crud.get_clients(db, tenant_id=current_user.tenant_id)

@router.post("", response_model=schemas.Client)
def create_new_client(
    client: schemas.ClientCreate, # Dados do novo cliente.
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria um novo cliente no sistema.
    Requer autenticação.
    """
    # Chama a função CRUD para criar o cliente no banco de dados.
    new_client = crud.create_client(db=db, client=client, tenant_id=current_user.tenant_id)
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        client_data = schemas.Client.model_validate(new_client).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "client_created", client_data)
        
    return new_client

@router.get("/{client_id}", response_model=schemas.Client)
def get_single_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Retorna um cliente específico pelo ID.
    Requer autenticação.
    """
    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    return client

@router.put("/{client_id}", response_model=schemas.Client)
def update_existing_client(
    client_id: int,
    client: schemas.ClientUpdate, # Usando ClientUpdate
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Atualiza um cliente existente.
    Requer autenticação.
    """
    updated_client = crud.update_client(db, client_id=client_id, client_update=client)
    if not updated_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        client_data = schemas.Client.model_validate(updated_client).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "client_updated", client_data)
        
    return updated_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Remove um cliente.
    Requer autenticação.
    """
    deleted_client = crud.delete_client(db, client_id=client_id)
    if not deleted_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    return None

@router.put("/bind-telegram", response_model=schemas.Client)
def bind_telegram_id(
    phone: str,
    telegram_id: str,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """
    Vincula um Telegram ID a um cliente baseado no telefone (chamado pelo n8n).
    """
    # Limpa o telefone para busca (apenas números)
    clean_phone = "".join(filter(str.isdigit, phone))
    
    client = crud.get_client_by_phone(db, clean_phone[-8:], tenant_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado com este telefone")
        
    client.telegram_id = telegram_id
    db.commit()
    db.refresh(client)
    return client

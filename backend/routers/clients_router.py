"""
Este módulo define as rotas da API para gerenciamento de clientes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
import schemas
import crud
import auth
from database import get_db # Função de dependência para obter a sessão do banco de dados.

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
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria um novo cliente no sistema.
    Requer autenticação.
    """
    # Chama a função CRUD para criar o cliente no banco de dados.
    return crud.create_client(db=db, client=client, tenant_id=current_user.tenant_id)

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

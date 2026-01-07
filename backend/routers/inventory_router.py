"""
Este módulo define as rotas da API para gerenciamento de inventário (estoque de peças)
e movimentações de estoque.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
import schemas
import crud
import auth
from database import get_db # Função de dependência para obter a sessão do banco de dados.
import models
from models import UserRole

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(prefix="/api/inventory", tags=["Inventário"])

# --- PARTS (Peças) ---
# Endpoints para gerenciar as peças em estoque.

@router.get("/parts", response_model=List[schemas.Part])
def get_all_parts(
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna uma lista de todas as peças do estoque.
    Requer autenticação.
    """
    # Chama a função CRUD para buscar todas as peças do banco de dados.
    return crud.get_parts(db, tenant_id=current_user.tenant_id)

@router.get("/parts/{part_id}", response_model=schemas.Part)
def get_single_part(
    part_id: int, # ID da peça a ser buscada, passado como parâmetro de caminho.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna uma peça específica pelo seu ID.
    Requer autenticação.
    Levanta um HTTPException 404 se a peça não for encontrada.
    """
    # Chama a função CRUD para buscar uma peça pelo ID.
    part = crud.get_part(db, part_id=part_id)
    if not part:
        # Se a função CRUD retornar None, a peça não foi encontrada.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Peça não encontrada")
    return part

@router.post("/parts", response_model=schemas.Part)
def create_new_part(
    part: schemas.PartCreate, # Dados da nova peça para criação.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria uma nova peça no estoque.
    Requer autenticação.
    Verifica se o SKU já existe para evitar duplicatas.
    """
    # Verifica se o SKU (Stock Keeping Unit) já existe.
    existing = crud.get_part_by_sku(db, sku=part.sku)
    if existing:
        # Se o SKU já existe, levanta uma exceção HTTP 400 Bad Request.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU já existe")
    # Chama a função CRUD para criar a peça no banco de dados.
    return crud.create_part(db=db, part=part, tenant_id=current_user.tenant_id)

@router.put("/parts/{part_id}", response_model=schemas.Part)
def update_existing_part(
    part_id: int, # ID da peça a ser atualizada.
    part_update: schemas.PartUpdate, # Dados de atualização da peça.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Atualiza os dados de uma peça existente pelo seu ID.
    Requer autenticação.
    Levanta um HTTPException 404 se a peça não for encontrada.
    """
    # Se o SKU foi alterado, verificar duplicidade no mesmo tenant
    if part_update.sku:
        existing = crud.get_part_by_sku(db, sku=part_update.sku)
        if existing and existing.id != part_id and existing.tenant_id == current_user.tenant_id:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU já existe neste inventário")

    # Chama a função CRUD para atualizar a peça.
    updated_part = crud.update_part(db, part_id=part_id, part_update=part_update)
    if not updated_part:
        # Se a função CRUD retornar None, a peça não foi encontrada.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Peça não encontrada")
    return updated_part

@router.delete("/parts/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_part(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Deleta uma peça do estoque pelo seu ID.
    Requer autenticação.
    Levanta um HTTPException 404 se a peça não for encontrada.
    """
    success = crud.delete_part(db, part_id=part_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Peça não encontrada")
    return None

# --- MOVEMENTS (Movimentações de Estoque) ---
# Endpoints para gerenciar o histórico de movimentações de estoque.

@router.get("/movements", response_model=List[schemas.StockMovement])
def get_all_movements(
    part_id: Optional[int] = None, # Parâmetro de query opcional para filtrar movimentos por ID da peça.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Retorna o histórico de todas as movimentações de estoque (Kardex),
    opcionalmente filtrado por ID da peça.
    Requer autenticação.
    """
    # Chama a função CRUD para buscar as movimentações de estoque.
    return crud.get_movements(db, tenant_id=current_user.tenant_id, part_id=part_id)

@router.post("/movements", response_model=schemas.StockMovement)
def create_stock_movement(
    movement: schemas.StockMovementCreate, # Dados da nova movimentação de estoque.
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria uma nova movimentação manual de estoque (ex: ajuste de estoque).
    Requer autenticação.
    """
    # Chama a função CRUD para criar a movimentação no banco de dados.
    return crud.create_stock_movement(db=db, movement=movement, user_name=current_user.name, tenant_id=current_user.tenant_id)


# --- QUICK SALE (PDV) ---

@router.post("/quick-sale")
def process_quick_sale(
    sale: schemas.QuickSaleRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.require_role([UserRole.ADMIN, UserRole.TECHNICIAN]))
):
    """
    Processa uma venda direta (PDV) de peças.
    1. Valida estoque.
    2. Deduz quantidades (MovementType.SALE_DIRECT).
    3. Gera Transação de Entrada (Receita).
    """
    from datetime import datetime
    
    total_sale_value = 0.0
    items_summary = []
    
    # Validação de Segurança (PDV)
    if current_user.role == UserRole.TECHNICIAN:
        for item in sale.items:
            if item.discount_percent > 10:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail="Técnicos só podem dar até 10% de desconto. Solicite autorização ao Admin."
                )

    # Validação Prévia de Estoque
    for item in sale.items:
        part = crud.get_part(db, part_id=item.part_id)
        if not part:
             raise HTTPException(status_code=404, detail=f"Peça ID {item.part_id} não encontrada.")
        
        if part.quantity < item.quantity:
             raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {part.name} (SKU: {part.sku}). Disponível: {part.quantity}")

    # Processamento
    try:
        for item in sale.items:
            part = crud.get_part(db, part_id=item.part_id) 
            
            # Calculo de valores para este item
            unit_price = part.price
            discount_amount = unit_price * (item.discount_percent / 100.0)
            final_unit_price = unit_price - discount_amount
            total_item = final_unit_price * item.quantity
            
            total_sale_value += total_item
            
            # Criar Movimento de Saída
            mov = schemas.StockMovementCreate(
                part_id=part.id,
                type=models.MovementType.SALE_DIRECT,
                quantity=item.quantity,
                description=f"Venda Direta PDV - Desc: {item.discount_percent}%"
            )
            crud.create_stock_movement(db, mov, user_name=current_user.name, tenant_id=current_user.tenant_id)
            
            items_summary.append(f"{item.quantity}x {part.name}")
            
        # Criar Transação Financeira
        if total_sale_value > 0:
            transaction = models.Transaction(
                tenant_id=current_user.tenant_id,
                description=f"Venda Balcão: {', '.join(items_summary)[:100]}",
                amount=total_sale_value,
                type="INCOME", # Receita
                category="VENDAS_PECAS",
                date=datetime.utcnow(),
                payment_method=sale.payment_method or "DINHEIRO",
                notes=sale.notes
            )
            db.add(transaction)
            db.commit()
            
        return {"status": "success", "total_value": total_sale_value, "items_count": len(sale.items)}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar venda: {str(e)}")


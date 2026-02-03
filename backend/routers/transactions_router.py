from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
from backend import schemas
from backend import crud
from backend import auth
from backend.database import get_db
from backend.services.finance_import_service import FinanceImportService
from backend import integrations

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(prefix="/api/transactions", tags=["Transações Financeiras"])

@router.get("", response_model=List[schemas.Transaction])
def get_all_transactions(
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Lista todas as transações financeiras registradas.
    Requer autenticação.
    """
    # Chama a função CRUD para obter todas as transações do banco de dados.
    return crud.get_transactions(db, tenant_id=current_user.tenant_id)

@router.post("", response_model=schemas.Transaction)
def create_new_transaction(
    transaction: schemas.TransactionCreate, # Dados da nova transação para criação.
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), # Injeta a sessão do banco de dados.
    current_user: schemas.User = Depends(auth.get_current_active_user) # Garante que o usuário esteja autenticado.
):
    """
    Cria uma nova transação financeira no sistema.
    Requer autenticação.
    """
    # Chama a função CRUD para criar a transação no banco de dados.
    new_txn = crud.create_transaction(db=db, transaction=transaction, tenant_id=current_user.tenant_id)
    
    # --- N8N INTEGRATION ---
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if company and company.n8n_webhook_url:
        txn_data = schemas.Transaction.model_validate(new_txn).model_dump(mode='json')
        background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "transaction_created", txn_data)
        
    return new_txn

@router.post("/import", response_model=List[schemas.Transaction])
async def import_financial_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Importa transações de um arquivo PDF, CSV ou OFX.
    """
    content = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.csv'):
            transactions_data = FinanceImportService.parse_csv(content)
        elif filename.endswith('.pdf'):
            transactions_data = FinanceImportService.parse_pdf(content)
        elif filename.endswith('.ofx'):
            transactions_data = FinanceImportService.parse_ofx(content)
        else:
            raise HTTPException(status_code=400, detail="Formato de arquivo não suportado. Use PDF, CSV ou OFX.")

        imported_transactions = []
        for txn_data in transactions_data:
            # Add tenant_id and map to schema
            txn_create = schemas.TransactionCreate(
                type=txn_data.get("type", "EXPENSE"),
                category=txn_data.get("category", "Importado"),
                description=txn_data.get("description", "Sem descrição"),
                amount=txn_data.get("amount", 0.0),
                date=txn_data.get("date"),
                status=txn_data.get("status", "PAID"),
                document_number=txn_data.get("document_number")
            )
            # Save to DB
            new_txn = crud.create_transaction(db=db, transaction=txn_create, tenant_id=current_user.tenant_id)
            imported_transactions.append(new_txn)
            
        # --- N8N INTEGRATION ---
        if imported_transactions:
            company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
            if company and company.n8n_webhook_url:
                summary_data = {
                    "count": len(imported_transactions),
                    "filename": file.filename,
                    "total_amount": sum(t.amount for t in imported_transactions),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                background_tasks.add_task(integrations.trigger_n8n_event, company.n8n_webhook_url, "transactions_imported", summary_data)

        return imported_transactions

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Erro na importação: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar importação: {str(e)}")

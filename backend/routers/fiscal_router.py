"""
Este módulo define as rotas da API para operações fiscais,
como a emissão de notas fiscais eletrônicas (NF-e/NFS-e).
Ele utiliza um serviço fiscal (`fiscal_service`) para gerar, assinar e transmitir
os documentos fiscais.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import sys
import os

# Adiciona o diretório pai (backend) ao sys.path para permitir importações relativas.
# Embora funcione, é uma abordagem que pode ser frágil em projetos maiores.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.fiscal_service import fiscal_service # Importa o serviço que lida com a lógica fiscal.
from auth import get_current_active_user

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(
    prefix="/api/fiscal",
    tags=["Fiscal"], # Tag para agrupar as rotas fiscais na documentação.
    responses={404: {"description": "Não encontrado"}}, # Resposta padrão para 404.
)

# --- Modelos Pydantic para dados fiscais ---
# Estes modelos definem a estrutura dos dados esperados para as operações fiscais.

class FiscalItem(BaseModel):
    """
    Representa um item de serviço ou produto em uma nota fiscal.
    """
    code: str # Código do item.
    desc: str # Descrição do item.
    qty: float # Quantidade.
    price: float # Preço unitário.
    total: float # Valor total do item (qty * price).

class FiscalAddress(BaseModel):
    """
    Representa um endereço para entidades fiscais.
    """
    street: str # Rua.
    number: str # Número.
    neighborhood: str # Bairro.
    city: str # Cidade.
    state: str # Estado (sigla).
    zip: str # CEP.

class FiscalEntity(BaseModel):
    """
    Representa uma entidade fiscal, como emissor ou recebedor da nota.
    Pode ser pessoa física ou jurídica.
    """
    name: Optional[str] = None # Nome da pessoa física.
    companyName: Optional[str] = None # Razão social da empresa.
    tradeName: Optional[str] = None # Nome fantasia.
    doc: Optional[str] = None # Documento (CPF ou CNPJ), formato genérico.
    cnpj: Optional[str] = None # CNPJ específico (para uso na geração da NF-e).
    ie: Optional[str] = None # Inscrição Estadual.
    address: Optional[FiscalAddress] = None # Endereço da entidade.
    crt: Optional[str] = None # Código de Regime Tributário.

class InvoiceRequest(BaseModel):
    """
    Define a estrutura completa de uma requisição para emissão de nota fiscal.
    """
    type: str # Tipo da nota: "NFE" (Nota Fiscal Eletrônica de Produto) ou "NFSE" (Nota Fiscal de Serviço Eletrônica).
    issuer: FiscalEntity # Dados da entidade emissora da nota.
    recipient: FiscalEntity # Dados da entidade recebedora da nota.
    items: Optional[List[FiscalItem]] = [] # Lista de itens (produtos/serviços) da nota.
    serviceValue: Optional[float] = 0 # Valor total dos serviços (para NFS-e).
    totalValue: float # Valor total geral da nota.
    naturezaOperacao: Optional[str] = None # Natureza da Operação (ex: "Venda de Mercadoria").
    issRetido: Optional[bool] = False # Indica se o ISS foi retido (para NFS-e).

# Nova importação
from services.fiscal_provider import FiscalProvider
from database import get_db
from sqlalchemy.orm import Session
from models import CompanyInfo
import models

# ... (código existente mantido até InvoiceRequest)

@router.post("/emit")
async def emit_invoice(
    invoice: InvoiceRequest,
    current_user: models.User = Depends(get_current_active_user), # Autenticação
    db: Session = Depends(get_db)
):
    """
    Endpoint para emitir nota fiscal usando Emissor Próprio (Custo Zero).
    Seleciona automaticamente o driver (SEFAZ, Curitiba ou Paranaguá).
    """
    try:
        # 1. Obter configurações da empresa (Tenant)
        company = db.query(CompanyInfo).filter(CompanyInfo.tenant_id == current_user.tenant_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Configure os dados da empresa (CNPJ, Endereço, Certificado) antes de emitir.")

        # 2. Inicializar Provider
        provider = FiscalProvider(company)
        
        # 3. Preparar dados
        invoice_data = invoice.model_dump()
        
        # Sequencial (Simples incremento para MVP)
        # Em produção, isso deve ser transacional e atômico
        next_seq = (company.sequence_nfe or 0) + 1
        
        # 4. Emitir (Geração XML -> Assinatura -> Envio)
        result = provider.emit(invoice_data['type'], invoice_data, next_seq)
        
        # 5. Atualizar sequencial no banco se sucesso
        if result['status'] == 'AUTHORIZED':
            company.sequence_nfe = next_seq
            db.commit()
            
        return result
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro na emissão fiscal: {str(e)}")
        
    except Exception as e:
        # Em caso de erro, levanta um HTTPException 500 com a mensagem de erro.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao emitir nota fiscal: {str(e)}")

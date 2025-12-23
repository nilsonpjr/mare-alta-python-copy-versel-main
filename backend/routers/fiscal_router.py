"""
Este módulo define as rotas da API para operações fiscais,
como a emissão de notas fiscais eletrônicas (NF-e/NFS-e).
Ele utiliza um serviço fiscal (`fiscal_service`) para gerar, assinar e transmitir
os documentos fiscais.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import sys
import os
from datetime import datetime

# Adiciona o diretório pai (backend) ao sys.path para permitir importações relativas.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.fiscal_service import fiscal_service # Importa o serviço que lida com a lógica fiscal.
from auth import get_current_active_user
import models
from models import CompanyInfo, FiscalInvoice, Client, InvoiceType, InvoiceStatus
from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import desc
from services.fiscal_provider import FiscalProvider

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(
    prefix="/api/fiscal",
    tags=["Fiscal"], # Tag para agrupar as rotas fiscais na documentação.
    responses={404: {"description": "Não encontrado"}}, # Resposta padrão para 404.
)

# --- Modelos Pydantic para dados fiscais ---

class FiscalItem(BaseModel):
    code: str 
    desc: str 
    qty: float 
    price: float 
    total: float 

class FiscalAddress(BaseModel):
    street: str 
    number: str 
    neighborhood: str 
    city: str 
    state: str 
    zip: str 

class FiscalEntity(BaseModel):
    name: Optional[str] = None 
    companyName: Optional[str] = None 
    tradeName: Optional[str] = None 
    doc: Optional[str] = None 
    cnpj: Optional[str] = None 
    ie: Optional[str] = None 
    address: Optional[FiscalAddress] = None
    crt: Optional[str] = None 

class InvoiceRequest(BaseModel):
    type: str 
    issuer: FiscalEntity 
    recipient: FiscalEntity 
    items: Optional[List[FiscalItem]] = []
    serviceValue: Optional[float] = 0
    totalValue: float 
    naturezaOperacao: Optional[str] = None
    issRetido: Optional[bool] = False
    serviceOrderId: Optional[int] = None

class FiscalInvoiceResponse(BaseModel):
    id: str # Frontend expects string ID usually
    type: str 
    number: Optional[str] = None
    series: Optional[str] = None
    status: str
    issuedAt: datetime
    recipientName: str
    recipientDoc: str
    totalValue: float
    authorizationProtocol: Optional[str] = None
    rejectionReason: Optional[str] = None
    xml: Optional[str] = None

@router.get("/", response_model=List[FiscalInvoiceResponse])
async def list_fiscal_invoices(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """
    Lista as notas fiscais emitidas pelo tenant atual.
    """
    invoices = db.query(FiscalInvoice)\
        .filter(FiscalInvoice.tenant_id == current_user.tenant_id)\
        .order_by(desc(FiscalInvoice.created_at))\
        .limit(limit)\
        .offset(offset)\
        .all()
        
    response = []
    for inv in invoices:
        # Resolve Client Info
        client_name = inv.client.name if inv.client else "Desconhecido"
        client_doc = inv.client.document if inv.client else ""
        
        # Map fields
        resp_item = FiscalInvoiceResponse(
            id=str(inv.id),
            type=inv.invoice_type.value if hasattr(inv.invoice_type, 'value') else str(inv.invoice_type),
            number=inv.invoice_number,
            series=inv.serie,
            status=inv.status.value if hasattr(inv.status, 'value') else str(inv.status),
            issuedAt=inv.issue_date,
            recipientName=client_name,
            recipientDoc=client_doc,
            totalValue=inv.total_value,
            authorizationProtocol=inv.authorization_protocol,
            rejectionReason=inv.rejection_reason,
            xml=inv.xml_content
        )
        response.append(resp_item)
        
    return response

@router.post("/emit")
async def emit_invoice(
    invoice: InvoiceRequest,
    current_user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    """
    Endpoint para emitir nota fiscal.
    """
    try:
        # 1. Obter configurações
        company = db.query(CompanyInfo).filter(CompanyInfo.tenant_id == current_user.tenant_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Configure os dados da empresa (CNPJ, Endereço, Certificado) antes de emitir.")

        # 2. Inicializar Provider
        provider = FiscalProvider(company)
        
        # 3. Identificar ou Criar Cliente
        client_doc = invoice.recipient.doc
        client_name = invoice.recipient.name or invoice.recipient.companyName
        
        if not client_doc:
            raise HTTPException(status_code=400, detail="Documento do destinatário (CPF/CNPJ) é obrigatório.")
            
        client = db.query(Client).filter(
            Client.tenant_id == current_user.tenant_id,
            Client.document == client_doc
        ).first()
        
        if not client:
            client = Client(
                tenant_id=current_user.tenant_id,
                name=client_name or "Cliente Desconhecido",
                document=client_doc,
                type="EMPRESA" if len(client_doc) > 11 else "PARTICULAR"
            )
            db.add(client)
            db.commit()
            db.refresh(client)
            
        # 4. Sequencial
        next_seq = (company.sequence_nfe or 0) + 1
        
        # 5. Criar Registro FiscalInvoice
        invoice_type_enum = InvoiceType.NFE if invoice.type.upper() == "NFE" else InvoiceType.NFSE
        
        fiscal_invoice = FiscalInvoice(
            tenant_id=current_user.tenant_id,
            invoice_type=invoice_type_enum,
            invoice_number=str(next_seq),
            serie=str(company.series_nfe or "1"),
            service_order_id=invoice.serviceOrderId,
            client_id=client.id,
            total_value=invoice.totalValue,
            net_value=invoice.totalValue, 
            status=InvoiceStatus.PROCESSING,
            issue_date=datetime.utcnow()
        )
        db.add(fiscal_invoice)
        db.commit()
        db.refresh(fiscal_invoice)
        
        # 6. Emitir
        invoice_data = invoice.model_dump()
        result = provider.emit(invoice_data['type'], invoice_data, next_seq)
        
        # 7. Atualizar Registro
        if result['status'] == 'AUTHORIZED':
            fiscal_invoice.status = InvoiceStatus.AUTHORIZED
            fiscal_invoice.authorization_protocol = result.get('protocol')
            fiscal_invoice.xml_content = result.get('xml')
            fiscal_invoice.authorization_date = datetime.utcnow()
            
            company.sequence_nfe = next_seq
            
        elif result['status'] == 'REJECTED':
            fiscal_invoice.status = InvoiceStatus.REJECTED
            fiscal_invoice.rejection_reason = result.get('message')
        else:
            fiscal_invoice.status = InvoiceStatus.ERROR
            fiscal_invoice.rejection_reason = result.get('message')
            
        db.commit()
        
        result['db_id'] = fiscal_invoice.id
        result['number'] = str(next_seq)
            
        return result
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro na emissão fiscal: {str(e)}")

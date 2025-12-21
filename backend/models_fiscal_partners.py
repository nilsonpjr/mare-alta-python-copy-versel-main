

# --- FISCAL MODELS ---
# Modelos para emissão de notas fiscais (NFe e NFSe)

class InvoiceType(str, enum.Enum):
    """
    Enum para tipos de nota fiscal.
    NFE: Nota Fiscal Eletrônica (produtos/peças)
    NFSE: Nota Fiscal de Serviços Eletrônica
    """
    NFE = "NFE"
    NFSE = "NFSE"

class InvoiceStatus(str, enum.Enum):
    """
    Enum para status de emissão de nota fiscal.
    """
    DRAFT = "Rascunho"
    PROCESSING = "Processando"
    AUTHORIZED = "Autorizada"
    CANCELED = "Cancelada"
    REJECTED = "Rejeitada"
    ERROR = "Erro"

class FiscalInvoice(Base):
    """
    Modelo para a tabela 'fiscal_invoices'. 
    Armazena informações de notas fiscais emitidas (NFe/NFSe).
    """
    __tablename__ = "fiscal_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Tipo e número
    invoice_type = Column(Enum(InvoiceType), nullable=False)
    invoice_number = Column(String(50), nullable=True)  # Número da nota (gerado após autorização)
    serie = Column(String(10), default="1")
    
    # Relacionamento com OS (opcional, pode ser venda avulsa)
    service_order_id = Column(Integer, ForeignKey("service_orders.id"), nullable=True)
    
    # Cliente
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Valores
    total_value = Column(Float, nullable=False)
    tax_value = Column(Float, default=0)  # Impostos
    net_value = Column(Float, nullable=False)  # Valor líquido
    
    # Status e controle
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    issue_date = Column(DateTime, default=datetime.utcnow)
    authorization_date = Column(DateTime, nullable=True)
    
    # Dados da API de emissão (FocusNFe, eNotas, etc)
    api_provider = Column(String(50), nullable=True)  # ex: "focusnfe"
    api_reference = Column(String(100), nullable=True)  # ID na API externa
    access_key = Column(String(44), nullable=True)  # Chave de acesso da NFe
    xml_content = Column(Text, nullable=True)  # XML da nota
    pdf_url = Column(String(500), nullable=True)  # URL do PDF
    
    # Motivo de cancelamento/rejeição
    cancellation_reason = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant")
    service_order = relationship("ServiceOrder", back_populates="fiscal_invoices")
    client = relationship("Client")


# --- PARTNER NETWORK MODELS (FASE 3) ---
# Modelos para rede de parceiros (eletricistas, capoteiros, etc)

class PartnerType(str, enum.Enum):
    """
    Enum para tipos de parceiros.
    """
    ELECTRICIAN = "Eletricista"
    UPHOLSTERER = "Capoteiro"
    PAINTER = "Pintor"
    MECHANIC = "Mecânico"
    REFRIGERATION = "Refrigeração"
    ELECTRONICS = "Eletrônica"
    FIBERGLASS = "Fibra de Vidro"
    OTHER = "Outro"

class Partner(Base):
    """
    Modelo para a tabela 'partners'.
    Cadastro de parceiros/terceiros que prestam serviços.
    """
    __tablename__ = "partners"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Dados básicos
    name = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=True)
    document = Column(String(20), nullable=True)  # CPF/CNPJ
    partner_type = Column(Enum(PartnerType), nullable=False)
    
    # Contato
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    
    # Avaliação
    rating = Column(Float, default=0)  # 0-5 estrelas
    total_jobs = Column(Integer, default=0)
    
    # Status
    active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant")
    partner_quotes = relationship("PartnerQuote", back_populates="partner")


class InspectionStatus(str, enum.Enum):
    """
    Enum para status de inspeção técnica.
    """
    SCHEDULED = "Agendada"
    IN_PROGRESS = "Em Andamento"
    COMPLETED = "Concluída"
    CANCELED = "Cancelada"

class TechnicalInspection(Base):
    """
    Modelo para a tabela 'technical_inspections'.
    Inspeções técnicas feitas por analistas (checklist mobile).
    """
    __tablename__ = "technical_inspections"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Relacionamentos
    boat_id = Column(Integer, ForeignKey("boats.id"), nullable=False)
    inspector_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status e data
    status = Column(Enum(InspectionStatus), default=InspectionStatus.SCHEDULED)
    scheduled_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    
    # Observações gerais
    general_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant")
    boat = relationship("Boat")
    inspector = relationship("User")
    checklist_items = relationship("InspectionChecklistItem", back_populates="inspection", cascade="all, delete-orphan")
    partner_quotes = relationship("PartnerQuote", back_populates="inspection")


class ChecklistItemSeverity(str, enum.Enum):
    """
    Enum para severidade de item de checklist.
    """
    OK = "OK"
    ATTENTION = "Atenção"
    URGENT = "Urgente"
    CRITICAL = "Crítico"

class InspectionChecklistItem(Base):
    """
    Modelo para a tabela 'inspection_checklist_items'.
    Itens individuais do checklist de inspeção.
    """
    __tablename__ = "inspection_checklist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("technical_inspections.id"), nullable=False)
    
    # Categoria e descrição
    category = Column(String(100), nullable=False)  # ex: "Motor", "Elétrica", "Casco"
    item_description = Column(String(300), nullable=False)
    
    # Avaliação
    severity = Column(Enum(ChecklistItemSeverity), default=ChecklistItemSeverity.OK)
    notes = Column(Text, nullable=True)
    
    # Fotos
    photo_url = Column(String(500), nullable=True)  # URL da foto (pode ser base64 ou cloud storage)
    
    # Estimativa de reparo
    estimated_cost = Column(Float, nullable=True)
    recommended_partner_type = Column(Enum(PartnerType), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inspection = relationship("TechnicalInspection", back_populates="checklist_items")


class QuoteStatus(str, enum.Enum):
    """
    Enum para status de orçamento de parceiro.
    """
    REQUESTED = "Solicitado"
    RECEIVED = "Recebido"
    APPROVED = "Aprovado"
    REJECTED = "Rejeitado"
    COMPLETED = "Concluído"

class PartnerQuote(Base):
    """
    Modelo para a tabela 'partner_quotes'.
    Orçamentos solicitados a parceiros.
    """
    __tablename__ = "partner_quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Relacionamentos
    inspection_id = Column(Integer, ForeignKey("technical_inspections.id"), nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    
    # Descrição do serviço
    service_description = Column(Text, nullable=False)
    
    # Valores
    quoted_value = Column(Float, nullable=True)
    estimated_days = Column(Integer, nullable=True)
    
    # Status
    status = Column(Enum(QuoteStatus), default=QuoteStatus.REQUESTED)
    
    # Datas
    requested_date = Column(DateTime, default=datetime.utcnow)
    response_date = Column(DateTime, nullable=True)
    
    # Notes
    partner_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Rating após conclusão
    rating = Column(Float, nullable=True)  # 0-5
    rating_comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant")
    inspection = relationship("TechnicalInspection", back_populates="partner_quotes")
    partner = relationship("Partner", back_populates="partner_quotes")


# Adicionar relationship em ServiceOrder
# Nota: Adicionar no modelo ServiceOrder existente:
# fiscal_invoices = relationship("FiscalInvoice", back_populates="service_order")

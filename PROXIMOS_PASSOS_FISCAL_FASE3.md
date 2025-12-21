# 🚀 PRÓXIMOS PASSOS - Integração Fiscal + Fase 3

## ✅ O QUE FOI FEITO NESTA SESSÃO

### 1. **FASE 2 - 100% COMPLETA!** 🎉
- ✅ Internacionalização (i18n) implementada
- ✅ PT-BR e EN-US com 150+ strings traduzidas
- ✅ LanguageSwitcher integrado
- ✅ Build de produção bem-sucedido

### 2. **Modelos Criados (Arquivos de Referência)**
- ✅ `backend/models_fiscal_partners.py` - Modelos completos prontos para integração

---

## 📋 PLANO DE INTEGRAÇÃO

### PARTE A: Integração Fiscal (2-3 dias)

#### Passo 1: Limpar e Integrar Modelos ⏳
```bash
# Arquivo: backend/models.py
1. Remover duplicações causadas pela edição
2. Copiar modelos de models_fiscal_partners.py para models.py
3. Adicionar relationships em ServiceOrder:
   fiscal_invoices = relationship("FiscalInvoice", back_populates="service_order")
```

#### Passo 2: Criar Migração do Banco
```bash
cd backend
alembic revision --autogenerate -m "add_fiscal_and_partners_tables"
alembic upgrade head
```

#### Passo 3: Schemas Pydantic
```python
# Arquivo: backend/schemas.py
- FiscalInvoiceCreate
- FiscalInvoiceUpdate
- FiscalInvoice (response)
- PartnerCreate, PartnerUpdate, Partner
- TechnicalInspection schemas
- PartnerQuote schemas
```

#### Passo 4: CRUD Functions
```python
# Arquivo: backend/crud.py
- create_fiscal_invoice()
- get_fiscal_invoices()
- update_invoice_status()
- cancel_invoice()
- create_partner()
- rate_partner()
- create_inspection()
- add_checklist_item()
- request_partner_quote()
```

#### Passo 5: Integração FocusNFe
```python
# Novo arquivo: backend/services/focus_nfe.py
import requests

class FocusNFeService:
    def __init__(self, api_token):
        self.base_url = "https://api.foc usnfe.com.br"
        self.token = api_token
    
    def emit_nfe(self, invoice_data):
        # Emitir NFe de produtos/peças
        pass
    
    def emit_nfse(self, service_data):
        # Emitir NFSe de serviços
        pass
    
    def cancel_invoice(self, access_key, reason):
        # Cancelar nota
        pass
    
    def get_invoice_status(self, reference):
        # Consultar status
        pass
```

#### Passo 6: Routers API
```python
# Arquivo: backend/routers/fiscal_router.py
@router.post("/invoices/nfe")
@router.post("/invoices/nfse")
@router.get("/invoices")
@router.put("/invoices/{id}/cancel")
@router.get("/invoices/{id}/pdf")
```

#### Passo 7: Frontend - Tela de Emissão
```tsx
// Arquivo: frontend/components/FiscalView.tsx
- Lista de notas emitidas
- Botão "Emitir NFe" (peças)
- Botão "Emitir NFSe" (serviços)
- Status de processamento
- Download PDF/XML
- Cancelamento de nota
```

---

### PARTE B: Fase 3 - Rede de Parceiros (3-4 dias)

#### Passo 1: Parceiros CRUD (Frontend)
```tsx
// Arquivo: frontend/components/PartnersView.tsx
- Listagem de parceiros
- Cadastro (nome, tipo, telefone, etc)
- Avaliação (estrelas)
- Status ativo/inativo
```

#### Passo 2: Inspeção Técnica Mobile
```tsx
// Arquivo: frontend/components/InspectionView.tsx
- Design mobile-first
- Categorias (Motor, Elétrica, Casco, etc)
- Checklist por item
- Severidade (OK, Atenção, Urgente, Crítico)
- Upload de foto por item
- Estimativa de custo
```

#### Passo 3: Solicitar Orçamentos
```tsx
// Arquivo: frontend/components/PartnerQuotesView.tsx
- Vincular inspeção a parceiros
- Enviar solicitação de orçamento
- Receber valores
- Comparar orçamentos
- Aprovar/Rejeitar
```

#### Passo 4: Gerador de Orçamento Agregado
```tsx
// Arquivo: frontend/components/AggregatedQuoteView.tsx
- Consolidar orçamentos de múltiplos parceiros
- Gerar PDF único para cliente
- Totalizador geral
- Separação por categoria
```

---

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### FocusNFe (ou alternativa)
1. Criar conta em https://focusnfe.com.br
2. Obter API token
3. Configurar certificado digital A1/A3
4. Adicionar token em `backend/.env`:
```env
FOCUS_NFE_TOKEN=seu_token_aqui
FOCUS_NFE_ENV=homologacao  # ou producao
```

### OU Alternativas Gratuitas/Simples
- **eNotas.com.br** (mais simples)
- **PlugNotas** (boa para NFSe)
- **API da Sefaz** (complexo, requer certificado)

---

## 🎯 PRÓXIMA SESSÃO RECOMENDADA

### Opção 1: Focar em Fiscal (Prioridade Comercial)
1. Limpar models.py
2. Criar migração
3. Implementar serviço FocusNFe
4. Criar tela de emissão básica
5. Testar em homologação

### Opção 2: Focar em Parceiros (Diferencial Técnico)
1. Finalizar models.py
2. Criar migração
3. CRUD de parceiros (backend + frontend)
4. Tela de inspeção mobile
5. Sistema de orçamentos

### Opção 3: Híbrido (Recomendado)
1. Limpar e finalizar models.py ✅
2. Criar migração ✅
3. CRUD básico de parceiros ✅
4. Tela de inspeção mobile (MVP) ✅
5. Estrutura fiscal (sem emissão real ainda)

---

## 📊 ESTIMATIVA DE TEMPO

| Tarefa | Tempo Estimado |
|--------|---------------|
| Limpar models.py + migração | 30min |
| Schemas + CRUD fiscal | 2h |
| Integração FocusNFe | 3h |
| Frontend fiscal | 4h |
| **TOTAL FISCAL** | **~10h (2 dias)** |
| | |
| CRUD parceiros | 2h |
| Tela inspeção mobile | 4h |
| Sistema orçamentos | 3h |
| Agregador final | 2h |
| **TOTAL PARCEIROS** | **~11h (2 dias)** |

---

## 🐛 CORREÇÕES PENDENTES

1. **models.py** - Remover duplicações causadas pela edição
2. **Verificar relacionamentos** entre modelos
3. **Testar migração** antes de aplicar

---

## 📚 DOCUMENTAÇÃO CRIADA

- ✅ `GUIA_I18N.md` - Internacionalização
- ✅ `STATUS_ATUAL_SISTEMA.md` - Status completo
- ✅ `RESUMO_EXECUTIVO.md` - Visão executiva
- ✅ `ROADMAP_IMPLEMENTACAO.md` - Fase 2 completa
- ✅ `backend/models_fiscal_partners.py` - Modelos de referência
- ✅ `PROXIMOS_PASSOS_FISCAL_FASE3.md` - Este arquivo

---

## 💡 RECOMENDAÇÃO FINAL

**Começar próxima sessão com:**
1. Corrigir models.py (remover duplicações)
2. Criar migração Alembic
3. Implementar CRUD de parceiros (mais simples que fiscal)
4. Criar tela de cadastro de parceiros
5. Depois partir para fiscal com FocusNFe

**Motivo:** Parceiros é funcionalidade completa e independente. Fiscal requer conta externa e configuração complexa.

---

**Próxima Atualização:** Após implementação completa  
**Responsável:** Equipe Mare Alta  
**Status:** Pronto para iniciar implementação

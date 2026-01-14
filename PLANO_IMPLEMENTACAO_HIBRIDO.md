# 🛠️ PLANO DE IMPLEMENTAÇÃO HÍBRIDA (Vercel + Render + Supabase) - Consolidated 2026

Este documento guia a implementação da arquitetura dividida para contornar as limitações de tempo de execução (timeout) em Serverless e suportar o robô de automação (Playwright) e a persistência real de dados.

---

## 🏗️ Arquitetura Consolidada

1.  **Frontend (React 18 + Vite):** Hospedado na **Vercel**.
    *   **Premium UI & Dark Mode:** Frontend reconstruído para alta fidelidade.
    *   **Cloud Only:** Conecta-se exclusivamente ao Backend via `ApiService`. O suporte a `StorageService` (localStorage) foi descontinuado para garantir integridade.
2.  **Backend (FastAPI + Python 3.10+):** Hospedado no **Render** ou **Railway** (Web Service persistente).
    *   Roda como um serviço contínuo (não serverless) para evitar timeouts de 30s.
    *   Executa o Playwright (Chrome Headless) para scraping do portal Mercury Dealer.
3.  **Banco de Dados & Storage:** **Supabase**.
    *   PostgreSQL para persistência de 100% dos dados financeiros e operacionais.
    *   Supabase Storage para anexos de mídias de OS e fotos de inventário.

---

## 📋 Configurações de Deploy Final

### 1. Banco de Dados (Supabase) 🗄️
*   [x] Projeto Supabase Ativado.
*   [x] Tabelas criadas via migrações Alembic.
*   [x] `DATABASE_URL` obtido (usar porta 5432 para serviço persistente).

### 2. Backend (Render/Railway) 🐍
*   **Build Command:** `pip install -r requirements.txt && playwright install chromium`
*   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
*   **Environment Variables:**
    *   `DATABASE_URL`: Conexão direta PostgreSQL.
    *   `SUPABASE_URL` / `SUPABASE_KEY`: Gestão de anexos.
    *   `GEMINI_API_KEY`: Diagnóstico por IA.
    *   `MERCURY_LOGIN` / `MERCURY_PASSWORD`: Credenciais do Dealer.

### 3. Frontend (Vercel)  ▲
*   **Build Command:** `npm run build`
*   **Environment Variables:**
    *   `VITE_API_URL`: URL pública do backend no Render (ex: `https://api-marealta.onrender.com/api`).
    *   *Nota:* O build premium requer que esta variável mude o comportamento do `axios` para ignorar caminhos locais.

---

## 🚨 Validação Técnica (Jan 2026)

### 1. Sincronização em Nuvem (ApiService) [IMPLEMENTADO] ✅
O frontend foi refatorado para que Views como `FinanceView`, `OrdersView` e `UsersView` utilizem o singleton `ApiService`. Isso garante que:
- Não há perda de dados entre reloads de página.
- Multi-tenancy é respeitado (o backend filtra via Header Authorization JWT).

### 2. Estabilização JSX & Build [IMPLEMENTADO] ✅
- Removidos todos os bloqueadores de build.
- O bundle gerado é compatível com os tiers gratuitos de Vercel e Render.

---

## 🧪 Plano de Teste Pós-Deploy

1.  **Fluxo de Login:** Login no frontend (Vercel) -> Token JWT -> Persistência no Postgres.
2.  **OS Premium Workflow:** Criar uma OS -> Adicionar Peças -> Ver Rentabilidade -> Salvamento Automático em Cloud.
3.  **Teste de Mídia:** Upload de foto em OS -> Armazenamento no Supabase Bucket -> Exibição instantânea na galeria premium.
4.  **Mercury Scraping:** Consulta de serial number -> Processamento em segundo plano no Render -> Retorno via WebSocket ou Polling.

---
**Status:** ✅ Arquitetura operacional e validada.
**Responsável:** Antigravity (IA)
**Última Revisão:** 14/01/2026

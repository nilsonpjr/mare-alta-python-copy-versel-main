# 🛠️ PLANO DE IMPLEMENTAÇÃO HÍBRIDA (Vercel + Render + Supabase)

Este documento guia a implementação da arquitetura dividida para contornar as limitações de tempo de execução (timeout) em Serverless e suportar o robô de automação (Playwright).

---

## 🏗️ Arquitetura

1.  **Frontend (React/Vite):** Hospedado na **Vercel**.
    *   Responsável por toda a interface visual.
    *   Conecta-se ao Backend via API REST.
2.  **Backend (FastAPI + Python):** Hospedado no **Render** (Web Service).
    *   Roda como um serviço contínuo (não serverless).
    *   Executa o Playwright (Chrome Headless) para acessar a Mercury.
3.  **Banco de Dados & Storage:** **Supabase**.
    *   PostgreSQL para dados.
    *   Supabase Storage para fotos de barcos e peças.

---

## 📋 Passo a Passo de Deploy

### 1. Banco de Dados (Supabase) 🗄️
*   [ ] Criar projeto no Supabase.
*   [ ] Obter `DATABASE_URL` (Connection String - Modo Transaction ou Session).
    *   *Nota:* Para o Render (servidor persistente), use a porta 5432 (Session Mode) para melhor performance.
*   [ ] Obter `SUPABASE_URL` e `SUPABASE_KEY` (para Storage).

### 2. Backend (Render) 🐍
*   [ ] Criar novo "Web Service" no Render conectado ao repositório GitHub.
*   [ ] **Root Directory:** `backend`
*   [ ] **Build Command:** `pip install -r requirements.txt && playwright install chromium`
    *   *Crítico:* O comando `playwright install chromium` é obrigatório para o robô funcionar.
*   [ ] **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
*   [ ] **Environment Variables:**
    *   `DATABASE_URL`: (Link do Supabase)
    *   `SUPABASE_URL`: (Link do Projeto Supabase)
    *   `SUPABASE_KEY`: (Service Role Key ou Anon Key)
    *   `MERCURY_LOGIN`: (Login da oficina)
    *   `MERCURY_PASSWORD`: (Senha da oficina)
    *   `PYTHON_VERSION`: `3.9.0` (ou superior)

### 3. Frontend (Vercel)  ▲
*   [ ] Importar o projeto na Vercel.
*   [ ] **Root Directory:** `frontend`
*   [ ] **Build Command:** `npm run build`
*   [ ] **Output Directory:** `dist`
*   [ ] **Environment Variables:**
    *   `VITE_API_URL`: `https://sua-app-backend.onrender.com/api`
        *   *Atenção:* Isso aponta para o backend no Render. Sem isso, o frontend tentará acessar `/api` na própria Vercel e falhará (404).

---

## 🚨 Correções de Código Necessárias (Checklist de Erros)

Para que essa arquitetura funcione, precisamos corrigir os seguintes pontos no código atual:

### 1. `frontend/services/api.ts` [CRÍTICO] 🔴
**Erro:** O código atual assume que em produção (`import.meta.env.PROD`), a API está no mesmo domínio (`/api`).
**Solução:** Alterar para usar variável de ambiente.

```typescript
// ANTES
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

// DEPOIS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### 2. `backend/requirements.txt` [IMPORTANTE] 🟠
**Erro:** Certifique-se de que `playwright` está listado.
**Verificação:** O arquivo já contém `playwright==1.42.0`. Está correto.
**Ação Render:** Garantir que o comando de build instale os browsers (`playwright install chromium`).

### 3. `backend/main.py` [CORS] 🟢
**Verificação:** O CORS está configurado como `allow_origins=["*"]`.
**Status:** Funcional para o híbrido. Em produção, recomenda-se restringir para o domínio da Vercel (ex: `https://mare-alta.vercel.app`), mas `*` funciona.

### 4. Supabase Connection 🟡
**Atenção:** Se usar `pgbouncer` (porta 6543), adicione `?sslmode=require` na string de conexão do SQLAlchemy no Python.

---

## 🧪 Plano de Teste Pós-Deploy

1.  **Teste de Login:** Tentar logar no frontend (Vercel) e ver se recebe o Token do backend (Render).
2.  **Teste Mercury:** Ir em "Nova OS", digitar um serial (ex: `70380954`) e ver se o backend busca os dados (pode demorar 15-30s, o Render não deve dar timeout).
3.  **Teste de Imagens:** Tentar subir uma foto de peça e ver se aparece (testa integração Supabase Storage).

---
**Status:** Pronto para execução.

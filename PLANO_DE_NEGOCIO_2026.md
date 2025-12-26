# 🚀 PLANO DE NEGÓCIOS 2026 - Viverdi Nautica SaaS (Híbrido)
**Versão:** 3.0 (Arquitetura Híbrida Vercel + Render + Supabase)
**Data:** 26/12/2025

---

## 1. Resumo Executivo
O **Viverdi Nautica** é o primeiro ERP Náutico do Brasil com **Inteligência Artificial** e **Automação Robótica (RPA)** para oficinas autorizadas Mercury/Yamaha.

**Diferencial Tecnológico (A "Arma Secreta"):**
Diferente de sistemas comuns, o Viverdi Nautica usa um backend Python dedicado (no Render) capaz de **navegar sozinho** no portal da Mercury Marine para consultar garantias, peças e preços, algo que sistemas PHP/Node.js tradicionais não conseguem fazer com a mesma eficiência.

---

## 2. Problema vs. Solução

| O Problema da Oficina | A Solução Viverdi Nautica |
| :--- | :--- |
| **Erros de Garantia:** Mecânico digita número de série errado e perde a garantia. | **Busca Automática:** O sistema busca a garantia oficial direto na Mercury pelo Nº de Série. |
| **Orçamentos Lentos:** Demora 40 min procurando part numbers em catálogos PDF. | **Orçamento em 30s:** Kits prontos de revisão (100h, 300h) com preços atualizados. |
| **Estoque Furado:** Peças saem sem dar baixa. | **Baixa Automática:** Ao fechar a OS, o estoque é atualizado. |
| **Infraestrutura Ruim:** Internet da marina cai. | **Frontend Rápido:** Hospedado na Vercel (CDN Global) com backend robusto separado. |

---

## 3. Modelo de Receita (SaaS)

Devido ao custo de infraestrutura do Backend Dedicado (Render + RPA), o preço não pode ser de "app barato".

### 📦 Tabela de Preços Sugerida

| Plano | Público | Valor Mensal | Setup (Único) |
| :--- | :--- | :--- | :--- |
| **Mecânico PRO** | Autônomos (1 usuário) | **R$ 197,00** | R$ 497,00 |
| **Oficina Team** | Oficinas médias (até 5 usuários) | **R$ 497,00** | R$ 1.500,00 |
| **Marina Full** | Marinas e Estaleiros (ilimitado) | **R$ 997,00** | R$ 3.000,00 |

**Custos de Infraestrutura (Estimado por Cliente):**
- **Frontend (Vercel):** Gratuito (Tier Hobby) ou $20/mês (Pro).
- **Backend (Render):** $7/mês (Starter) a $25/mês (Standard p/ performance).
- **Banco de Dados (Supabase):** Gratuito (até 500MB) ou $25/mês.
- **Lucro Líquido:** Margem superior a 80% no plano Oficina Team.

---

## 4. Estratégia de Entrada no Mercado (Go-to-Market)

1.  **Parceria com Revendas de Peças:**
    *   Oferecer o sistema para quem compra peças Mercury no atacado. O sistema já vem com o catálogo da revenda importado.
2.  **"Isca" do Orçador Grátis:**
    *   Disponibilizar uma versão "Lite" que só faz orçamentos (sem financeiro/estoque) para capturar leads.
3.  **Certificação de Oficinas:**
    *   Criar o selo "Oficina Digital Mare Alta", passando credibilidade ao dono do barco.

---

## 5. Análise SWOT (Matriz Fofa)

**Forças (Strengths):**
*   Tecnologia RPA (Robô) exclusiva para Mercury.
*   UX/UI moderna (React + Tailwind).
*   Arquitetura escalável (separação Front/Back).

**Fraquezas (Weaknesses):**
*   Dependência do portal da Mercury (se mudarem o site, o robô precisa de ajuste).
*   Necessidade de conexão constante para o RPA (embora o resto funcione offline).

**Oportunidades (Opportunities):**
*   Expandir para Yamaha, Volvo Penta e BRP (Sea-Doo).
*   Marketplace B2B de peças entre oficinas.

**Ameaças (Threats):**
*   Sistemas de gestão genéricos (ContaAzul, Omie) tentando entrar no nicho.
*   A própria Mercury lançar um sistema para consumidor final.

---

## 6. Roadmap 2026

*   **Q1 (Jan-Mar):** Estabilidade da Infraestrutura Híbrida e Lançamento Beta.
*   **Q2 (Abr-Jun):** Módulo Fiscal (NFe/NFSe) e App do Técnico (PWA Offline).
*   **Q3 (Jul-Set):** CRM WhatsApp Automatizado.
*   **Q4 (Out-Dez):** Expansão para Yamaha e Volvo Penta.

---
**Conclusão:** O projeto é viável e lucrativo. A mudança para a arquitetura Vercel+Render resolve o gargalo técnico e permite escalar vendas sem travar o servidor.

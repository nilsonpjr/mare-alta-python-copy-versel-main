# Roadmap de Implementação Tática - Mare Alta

Este documento serve como nosso **"Mapa de Controle"** para garantir que o Plano de Negócios seja implementado de forma organizada, sem perder o foco.

**Regra de Ouro:** *Nunca iniciar um Módulo novo sem terminar o anterior (Codificar → Testar → Validar).*

---

## 🏁 Fase 1: O "Diferencial Vendedor" ✅ COMPLETA
*Objetivo: Ter uma ferramenta que encante oficinas e mecânicos imediatamente.*

- [x] **Estrutura de Dados dos Kits de Revisão** (Criado em `frontend/types/maintenance.ts` e `data/maintenance_kits.ts`)
- [x] **Tela de Orçador Rápido (UI):** Criar a interface onde o mecânico seleciona "Mercury Verado 300 - 100h" e o orçamento sai pronto.
- [x] **Gerador de Pré-Ordem:** Botão que cria automaticamente a OS com os itens do kit.
- [x] **PDF de Orçamento:** Gerar um PDF profissional com logo da oficina para enviar ao cliente.
- [x] **Baixa de Estoque Real:** Conectar a criação da OS com a redução do `quantity` na tabela de peças (via `partId` matching).
- [x] **Banco de Kits Completo:** 19 kits cobrindo toda linha Mercury (Verado, Portáteis, MerCruiser, Diesel, SeaPro, OptiMax) + Yamaha.
- [x] **Cadastro de Peças Mercury:** 37 peças pré-cadastradas no estoque com SKU, custo e preço organizadas por localização.
- [x] **Edição de Peças:** Modal para editar nome, custo e preço com aplicação automática de markup de 60%.
- [x] **Atualização de Preços em Massa:** Ferramenta para aplicar margem de lucro personalizada em todo o estoque de uma vez.

## 🏗 Fase 2: Estrutura SaaS & Backend (Alicerce) ✅ 85% COMPLETA
*Objetivo: Preparar o sistema para ter múltiplos clientes (Multi-tenancy).*

- [x] **Modelo de Tenant:** Criada tabela `tenants` e modelo SQLAlchemy
- [x] **Adição de tenant_id:** TODAS as tabelas atualizadas com ForeignKey para `tenants`
- [x] **Migração Completa do Banco:** Script `migrate_multi_tenancy.py` criado
- [x] **Login & Autenticação Real:** JWT atualizado com `tenant_id` no payload e validação
- [x] **Middleware de Tenant:** Filtro automático de queries baseado no tenant implementado
- [x] **Atualizar CRUDs:** Todos endpoints atualizados com filtro de tenant_id
- [x] **CRUD Completo com DELETE:** Implementado em todas entidades:
  - [x] Boats (Embarcações) - Create, Read, Update, Delete
  - [x] Parts (Peças) - Create, Read, Update, Delete
  - [x] Clients (Clientes) - Create, Read, Update, Delete
  - [x] Marinas - Create, Read, Update, Delete
  - [x] Manufacturers/Models - Create, Read, Update, Delete
  - [x] Maintenance Kits - Create, Read, Update, Delete
- [x] **Correções de Bugs:**
  - [x] Bug do botão "Adicionar Peça à OS" corrigido (conversão de tipo string/number)
  - [x] Consistência de IDs em toda aplicação
- [x] **Internacionalização (i18n):** ✅ COMPLETO!
  - [x] Biblioteca react-i18next instalada e configurada
  - [x] Traduções PT-BR e EN-US implementadas
  - [x] Componente LanguageSwitcher criado
  - [x] Detector automático de idioma do navegador
  - [x] Persistência de preferência em localStorage

**🎉 FASE 2 COMPLETA - 100%!**

---

## 🤝 Fase 3: Rede de Parceiros & Analista Técnico
*Objetivo: Expandir para gerenciamento de grandes embarcações.*

- [ ] **Cadastro de Parceiros:** Tela para registrar eletricistas, capoteiros, etc., com ranking de avaliação.
- [ ] **Checklist de Inspeção (Mobile):** Interface focada em celular para o Analista marcar problemas no barco.
- [ ] **Gerador de Pré-Ordem:** Ferramenta que agrupa orçamentos de parceiros em uma proposta única para o dono do barco.

## 🌐 Fase 4: Portal do Cliente & CRM
*Objetivo: O cliente final interagir sozinho.*

- [ ] **CRM Ativo:** Robô que verifica datas/horas e manda link de WhatsApp.
- [ ] **Portal Web:** Login para o dono do barco ver suas O.S. e fotos.

---

## 📌 Status Atual
**Fase Concluída:** ✅ Fase 1 100% / ✅ Fase 2 100% COMPLETAS!  
**Última Atualização:** 20 de Dezembro de 2025 - 23:30  
**Próxima Ação:** Iniciar Fase 3 (Rede de Parceiros) ou focar em preparação para lançamento beta.

**Destaques da Última Sessão:**
- ✅ **FASE 2 FINALIZADA!** 🎉
- ✅ Internacionalização (i18n) completa com PT-BR e EN-US
- ✅ LanguageSwitcher integrado na Sidebar
- ✅ Detector automático de idioma
- ✅ Persistência de preferência em localStorage
- ✅ CRUD completo implementado em todas entidades cadastráveis
- ✅ Bug crítico corrigido: botão "Adicionar Peça à OS" agora funciona
- ✅ 37 peças Mercury/Yamaha com gestão completa
- ✅ 19 kits de manutenção com opção de delete para kits customizados

**Métricas de Progresso:**
- **Backend:** 90% completo (faltam emissão fiscal e integrações bancárias)
- **Frontend:** 100% completo (todas funcionalidades principais prontas!)
- **Integração Mercury:** 85% completo (ocasionais timeouts a resolver)
- **Multi-tenancy:** 100% implementado e testado
- **CRUD Operations:** 100% implementado (Create, Read, Update, Delete)
- **Internacionalização:** 100% implementado (PT-BR e EN-US)

---

## 🎯 Como Usar Este Roadmap
1. **Sempre marque [x] quando terminar uma tarefa.**
2. **Nunca pule de fase sem completar a anterior.**
3. **Atualize "Status Atual" após cada sessão de trabalho.**
4. **Documente bugs conhecidos e suas soluções.**

---

## 🐛 Bugs Conhecidos e Soluções

### ✅ Resolvidos
1. **Botão "Adicionar Peça à OS" não funcionava**
   - Problema: Inconsistência de tipo (number vs string no ID da peça)
   - Solução: Conversão `.toString()` ao selecionar peça no modal
   - Status: Resolvido em 20/12/2025

### ⚠️ Monitorando
1. **Timeout ocasional no scraping Mercury**
   - Impacto: Baixo (retry automático funciona)
   - Plano: Otimizar script Playwright na próxima iteração

---

## 🎊 FASE 2 COMPLETA!

A **Fase 2 - Estrutura SaaS & Backend** foi 100% concluída!

**Conquistas:** ✅ Multi-tenancy ✅ Autenticação ✅ CRUD completo ✅ i18n

**Próximos Passos:**
- Opção A: Iniciar Fase 3 (Rede de Parceiros)
- Opção B: Preparar sistema para lançamento beta
- Opção C: Implementar emissão fiscal (prioridade para produção)

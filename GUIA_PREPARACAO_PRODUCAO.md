# 🚀 GUIA DE PREPARAÇÃO PARA PRODUÇÃO
**Viverdi Náutica - Sistema Mare Alta**  
**Data:** 2026-01-14  
**Versão:** 1.0.0

---

## 📋 SUMÁRIO

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Processo de Limpeza](#processo-de-limpeza)
4. [Credenciais Iniciais](#credenciais-iniciais)
5. [Configuração Pós-Limpeza](#configuração-pós-limpeza)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Este guia descreve o processo para preparar o sistema para produção, removendo todos os dados de teste e criando um ambiente limpo para começar a vender o produto.

### O que será feito:

✅ **Backup automático** do banco atual  
✅ **Remoção de todos os dados de teste**  
✅ **Manutenção da estrutura** das tabelas  
✅ **Reset de contadores** (IDs começam do 1)  
✅ **Criação de tenant padrão** (Viverdi Náutica)  
✅ **Criação de usuário admin** inicial  
✅ **Configurações básicas** do sistema  

### O que NÃO será afetado:

🔒 **Estrutura do banco** (tabelas, índices, constraints)  
🔒 **Código da aplicação**  
🔒 **Configurações de deploy**  
🔒 **Migrações aplicadas**  

---

## 🔧 PRÉ-REQUISITOS

### Ferramentas Necessárias

```bash
# PostgreSQL client tools
psql --version          # Deve estar instalado
pg_dump --version       # Para backups

# Python 3.9+
python --version        # 3.9 ou superior

# Bibliotecas Python
pip install python-dotenv psycopg2-binary
```

### Arquivos Necessários

- ✅ `.env` com `DATABASE_URL` configurado
- ✅ Acesso ao banco de dados PostgreSQL
- ✅ Permissões de escrita na pasta `backups/`

### Verificação Rápida

```bash
# Teste de conexão com o banco
psql $DATABASE_URL -c "SELECT 1"

# Deve retornar: "1"
```

---

## 🔄 PROCESSO DE LIMPEZA

### Opção 1: Script Automatizado (RECOMENDADO)

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Execute o script de preparação
python scripts/prepare_for_production.py
```

O script irá:
1. ⚠️  Mostrar avisos de segurança
2. 📦 Criar backup automático
3. ✋ Solicitar confirmação dupla
4. 🧹 Limpar o banco de dados
5. ✅ Verificar se tudo foi executado corretamente
6. 🔐 Mostrar credenciais de acesso

#### Confirmações Necessárias

```
1ª Confirmação: Digite "SIM QUERO LIMPAR"
2ª Confirmação: Digite "CONFIRMAR"
```

⚠️ **As confirmações são case-sensitive!**

---

### Opção 2: Passo a Passo Manual

#### Passo 1: Backup Manual

```bash
cd backend
python scripts/backup_database.py
```

Isso criará:
- `backups/backup_pre_producao_YYYYMMDD_HHMMSS.sql`
- `backups/backup_pre_producao_YYYYMMDD_HHMMSS.sql.gz` (compactado)
- `backups/backup_pre_producao_YYYYMMDD_HHMMSS.meta.txt` (metadados)

#### Passo 2: Executar SQL de Limpeza

```bash
# Método 1: Via psql
psql $DATABASE_URL -f scripts/reset_database_for_production.sql

# Método 2: Via pgAdmin ou DBeaver
# Abra o arquivo scripts/reset_database_for_production.sql
# Execute manualmente
```

#### Passo 3: Verificar Resultado

```bash
# Conecte ao banco
psql $DATABASE_URL

# Verifique as contagens
SELECT 'tenants' as table, COUNT(*) FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'boats', COUNT(*) FROM boats;

# Esperado:
# tenants  | 1   (Viverdi Náutica)
# users    | 1   (admin)
# clients  | 0   (vazio)
# boats    | 0   (vazio)
```

---

## 🔐 CREDENCIAIS INICIAIS

Após a limpeza, use estas credenciais para primeiro acesso:

```
📧 Email:  admin@viverdinautica.com
🔑 Senha:  admin123
👤 Role:   Administrador
🏢 Tenant: Viverdi Náutica (ID: 1)
```

### ⚠️ IMPORTANTE: Segurança

**Trocar a senha IMEDIATAMENTE no primeiro login!**

```
1. Faça login com credenciais acima
2. Vá em: Perfil → Segurança
3. Altere a senha para uma forte
4. Ative 2FA se disponível
```

Senha forte deve ter:
- ✅ Mínimo 12 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Caracteres especiais
- ❌ Não usar "admin", "123", etc

---

## ⚙️ CONFIGURAÇÃO PÓS-LIMPEZA

### 1. Dados da Empresa

Ao fazer primeiro login, configure:

```
Configurações → Dados da Empresa:
  - Nome da empresa
  - CNPJ real
  - Endereço completo
  - Telefones de contato
  - Email corporativo
  - Logo da empresa
```

### 2. Usuários Adicionais

```
Usuários → Adicionar Novo:
  - Criar usuário para cada funcionário
  - Definir roles apropriadas:
    • Administrador: Acesso total
    • Gestor: Gerenciamento operacional
    • Técnico: Apenas ordens de serviço
    • Atendente: CRM e vendas
```

### 3. Configurações Fiscais

```
Fiscal → Configurações:
  - Certificado Digital (A1)
  - Dados do emitente
  - Ambiente (Homologação primeiro!)
  - Séries de documentos
```

### 4. Integração Mercury (Opcional)

```
Configurações → Integrações → Mercury:
  - Usuário Mercury Marine
  - Senha do portal
  - Testar conexão
```

### 5. Estoque Inicial

Se já tiver peças em estoque:

```
Estoque → Importar:
  - Usar planilha modelo
  - Ou cadastrar manualmente
  - Registrar saldo inicial via "Ajuste"
```

---

## 🔍 VERIFICAÇÕES FINAIS

### Checklist Pré-Venda

- [ ] Backup do banco feito e guardado
- [ ] Dados de teste removidos
- [ ] Senha do admin alterada
- [ ] Dados da empresa configurados
- [ ] Usuários criados
- [ ] Certificado digital configurado (se usar fiscal)
- [ ] Logo da empresa enviada
- [ ] Teste de login realizado
- [ ] Teste de criação de OS realizado
- [ ] Teste de emissão fiscal realizado (em homologação)
- [ ] Documentação revisada

### Teste de Fumaça Rápido

```bash
# 1. Login
curl -X POST https://sua-url.com/api/auth/login \
  -d "username=admin@viverdinautica.com&password=SUA_NOVA_SENHA"

# 2. Listar clientes (deve estar vazio)
curl https://sua-url.com/api/clients \
  -H "Authorization: Bearer SEU_TOKEN"

# Esperado: []

# 3. Criar cliente de teste
curl -X POST https://sua-url.com/api/clients \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "teste@example.com",
    "type": "INDIVIDUAL"
  }'

# 4. Deletar cliente de teste
curl -X DELETE https://sua-url.com/api/clients/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🆘 TROUBLESHOOTING

### Erro: "DATABASE_URL not found"

```bash
# Verifique se .env existe
ls -la .env

# Verifique conteúdo
cat .env | grep DATABASE_URL

# Se não existir, crie:
echo "DATABASE_URL=postgresql://user:pass@host:port/db" > .env
```

### Erro: "pg_dump: command not found"

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Verificar instalação
which pg_dump
```

### Erro: "Permission denied" no backup

```bash
# Criar pasta de backups
mkdir -p backend/backups

# Dar permissões
chmod 755 backend/backups
```

### Backup restauração (em caso de erro)

```bash
# Se algo der errado, restaure o backup:
psql $DATABASE_URL < backups/backup_pre_producao_XXXXXX.sql

# Ou use pg_restore se for binário
pg_restore -d $DATABASE_URL backups/backup_pre_producao_XXXXXX.dump
```

### Resetar Senha do Admin

```sql
-- Se esquecer a senha, execute:
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5FS0I0rqG3uHe'
WHERE email = 'admin@viverdinautica.com';

-- Isso reseta para: admin123
```

---

## 📊 ESTATÍSTICAS ESPERADAS

Após limpeza bem-sucedida:

```
Tabela              | Registros | Status
--------------------|-----------|--------
tenants             | 1         | ✅
users               | 1         | ✅
clients             | 0         | ✅
boats               | 0         | ✅
engines             | 0         | ✅
service_orders      | 0         | ✅
parts               | 0         | ✅
stock_movements     | 0         | ✅
transactions        | 0         | ✅
marinas             | 0         | ✅
partners            | 0         | ✅
```

---

## 🎉 PRONTO PARA VENDER!

Sistema limpo e configurado. Agora você pode:

1. ✅ Começar a cadastrar clientes reais
2. ✅ Registrar embarcações
3. ✅ Criar ordens de serviço
4. ✅ Gerenciar estoque
5. ✅ Emitir documentos fiscais
6. ✅ **VENDER O SISTEMA!** 🚀

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas:

- 📧 Email: suporte@viverdinautica.com
- 📱 WhatsApp: (00) 00000-0000
- 🌐 Docs: https://docs.viverdinautica.com
- 🐛 Issues: https://github.com/seu-repo/issues

---

**Última atualização:** 2026-01-14  
**Versão do documento:** 1.0.0

-- ============================================================================
-- SCRIPT DE LIMPEZA PARA PRODUÇÃO - MARE ALTA / VIVERDI NÁUTICA
-- Data: 2026-01-14
-- 
-- ⚠️  ATENÇÃO: Este script APAGA TODOS OS DADOS DE TESTE!
-- ✅ Mantém: Estrutura das tabelas
-- ✅ Remove: Todos os dados (clientes, barcos, ordens, estoque, etc)
-- ✅ Cria: Tenant padrão + Usuário administrador inicial
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: BACKUP DE SEGURANÇA (Verificação)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '🔒 INICIANDO LIMPEZA DO BANCO DE DADOS';
    RAISE NOTICE '📅 Timestamp: %', NOW();
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Todos os dados serão removidos!';
    RAISE NOTICE '✅ Certifique-se de ter feito backup antes de continuar';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASSO 2: DESABILITAR CONSTRAINTS TEMPORARIAMENTE
-- ============================================================================
SET session_replication_role = 'replica';

-- ============================================================================
-- PASSO 3: LIMPAR DADOS (MANTÉM ESTRUTURA)
-- ============================================================================

-- Dados Fiscais e Documentos
TRUNCATE TABLE fiscal_documents CASCADE;
TRUNCATE TABLE fiscal_config CASCADE;

-- Movimentações Financeiras
TRUNCATE TABLE transactions CASCADE;

-- Estoque e Inventário
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE parts CASCADE;

-- Ordens de Serviço
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE service_orders CASCADE;

-- Motores e Embarcações
TRUNCATE TABLE engines CASCADE;
TRUNCATE TABLE boats CASCADE;

-- Clientes
TRUNCATE TABLE clients CASCADE;

-- Marinas e Parceiros
TRUNCATE TABLE marinas CASCADE;
TRUNCATE TABLE partners CASCADE;

-- Inspeções
TRUNCATE TABLE inspections CASCADE;

-- Cotações
TRUNCATE TABLE quotes CASCADE;
TRUNCATE TABLE quote_items CASCADE;

-- Orçamentos de Manutenção
TRUNCATE TABLE maintenance_budgets CASCADE;
TRUNCATE TABLE maintenance_budget_items CASCADE;

-- Usuários (exceto o que será criado)
TRUNCATE TABLE users CASCADE;

-- Configurações de Sistema
TRUNCATE TABLE system_config CASCADE;

-- Tenants (será recriado)
TRUNCATE TABLE tenants CASCADE;

-- Logs e Auditoria (opcional - descomente se quiser manter histórico)
-- TRUNCATE TABLE audit_logs CASCADE;

RAISE NOTICE '✓ Dados removidos com sucesso';

-- ============================================================================
-- PASSO 4: RESETAR SEQUENCES
-- ============================================================================

-- Reset de IDs para começar do 1
ALTER SEQUENCE IF EXISTS tenants_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS clients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS boats_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS engines_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS parts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_movements_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS marinas_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS partners_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inspections_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS quotes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS maintenance_budgets_id_seq RESTART WITH 1;

RAISE NOTICE '✓ Sequences resetadas';

-- ============================================================================
-- PASSO 5: CRIAR TENANT PADRÃO
-- ============================================================================

INSERT INTO tenants (
    name,
    slug,
    business_name,
    cnpj,
    plan,
    status,
    settings,
    created_at,
    updated_at
) VALUES (
    'Viverdi Náutica',
    'viverdi',
    'Viverdi Náutica LTDA',
    '00000000000000',
    'premium',
    'active',
    '{
        "theme": "light",
        "language": "pt-BR",
        "currency": "BRL",
        "timezone": "America/Sao_Paulo",
        "features": {
            "inventory": true,
            "fiscal": true,
            "crm": true,
            "warranty": true,
            "mercury_integration": true
        }
    }'::jsonb,
    NOW(),
    NOW()
) RETURNING id;

RAISE NOTICE '✓ Tenant padrão criado: Viverdi Náutica';

-- ============================================================================
-- PASSO 6: CRIAR USUÁRIO ADMINISTRADOR
-- ============================================================================

-- Senha padrão: "admin123" (hash bcrypt)
-- ⚠️  IMPORTANTE: Trocar esta senha no primeiro login!

INSERT INTO users (
    tenant_id,
    email,
    password_hash,
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    1,
    'admin@viverdinautica.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5FS0I0rqG3uHe',
    'Administrador',
    'admin',
    true,
    NOW(),
    NOW()
);

RAISE NOTICE '✓ Usuário admin criado';
RAISE NOTICE '   Email: admin@viverdinautica.com';
RAISE NOTICE '   Senha: admin123';
RAISE NOTICE '   ⚠️  TROCAR SENHA NO PRIMEIRO LOGIN!';

-- ============================================================================
-- PASSO 7: CRIAR CONFIGURAÇÕES INICIAIS
-- ============================================================================

INSERT INTO system_config (
    tenant_id,
    key,
    value,
    created_at,
    updated_at
) VALUES
    (1, 'company_name', '"Viverdi Náutica"'::jsonb, NOW(), NOW()),
    (1, 'company_email', '"contato@viverdinautica.com"'::jsonb, NOW(), NOW()),
    (1, 'company_phone', '"(00) 0000-0000"'::jsonb, NOW(), NOW()),
    (1, 'next_order_number', '1'::jsonb, NOW(), NOW()),
    (1, 'currency', '"BRL"'::jsonb, NOW(), NOW()),
    (1, 'language', '"pt-BR"'::jsonb, NOW(), NOW()),
    (1, 'timezone', '"America/Sao_Paulo"'::jsonb, NOW(), NOW());

RAISE NOTICE '✓ Configurações iniciais criadas';

-- ============================================================================
-- PASSO 8: REABILITAR CONSTRAINTS
-- ============================================================================
SET session_replication_role = 'origin';

RAISE NOTICE '';
RAISE NOTICE '============================================================';
RAISE NOTICE '✅ LIMPEZA CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '============================================================';
RAISE NOTICE '';
RAISE NOTICE '📊 RESUMO:';
RAISE NOTICE '   ✓ Todos os dados de teste removidos';
RAISE NOTICE '   ✓ Estrutura das tabelas mantida';
RAISE NOTICE '   ✓ Sequences resetadas';
RAISE NOTICE '   ✓ Tenant padrão criado (ID: 1)';
RAISE NOTICE '   ✓ Usuário admin criado';
RAISE NOTICE '';
RAISE NOTICE '🔐 CREDENCIAIS DE ACESSO:';
RAISE NOTICE '   Email: admin@viverdinautica.com';
RAISE NOTICE '   Senha: admin123';
RAISE NOTICE '';
RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
RAISE NOTICE '   1. Fazer login com as credenciais acima';
RAISE NOTICE '   2. TROCAR A SENHA IMEDIATAMENTE';
RAISE NOTICE '   3. Configurar dados da empresa';
RAISE NOTICE '   4. Criar usuários adicionais';
RAISE NOTICE '   5. Começar a usar o sistema!';
RAISE NOTICE '';
RAISE NOTICE '🚀 Sistema pronto para produção!';
RAISE NOTICE '============================================================';

COMMIT;

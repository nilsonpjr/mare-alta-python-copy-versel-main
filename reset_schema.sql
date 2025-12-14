
-- DROPA TODAS AS TABELAS para forçar a recriação correta pelo SQLAlchemy
-- ATENÇÃO: ISSO APAGA TUDO (ESTRUTURA E DADOS)

DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS service_items CASCADE;
DROP TABLE IF EXISTS order_notes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS engines CASCADE;
DROP TABLE IF EXISTS boats CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS marinas CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS company_info CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Depois de rodar isso, acesse o site novam ente. 
-- O Backend irá recriar todas as tabelas automaticamente com as colunas novas (tenant_id).

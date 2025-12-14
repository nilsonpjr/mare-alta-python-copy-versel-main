
-- Ativa RLS em todas as tabelas (boa prática de segurança em profundidade)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marinas ENABLE ROW LEVEL SECURITY;

-- Cria uma política permissiva para o nosso Back-end Python
-- Como o backend conecta com o usuário postgres/service_role, ele tem BYPASS RLS.
-- Mas para garantir que nenhuma conexão externa acidental veja dados, criamos policies.

-- Política padrão: Ninguém acesso direto (tudo bloqueado por default exceto superuser)
-- Se precisarmos dar acesso a alguma ferramenta externa no futuro, criamos policies especificas.

-- Para o usuário "postgres" ou "authenticated" (backend), o acesso continua funcionando pois eles são Superusers ou tem bypass.
-- O Supabase Service Role Key tem bypass RLS.

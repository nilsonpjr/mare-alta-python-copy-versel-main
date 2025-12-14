
-- Limpa TODAS as tabelas do banco de dados de uma vez, respeitando as referências (CASCADE).
-- CUIDADO: Isso apaga TODOS os dados. Use apenas para resetar o ambiente.

TRUNCATE TABLE 
    stock_movements,
    service_items,
    order_notes,
    transactions,
    service_orders,
    engines,
    boats,
    models,
    manufacturers,
    parts,
    marinas,
    clients,
    company_info,
    invoices,
    tenants
RESTART IDENTITY CASCADE;

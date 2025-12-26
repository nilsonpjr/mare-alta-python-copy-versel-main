-- Corrige a role do usuário administrador para garantir que ele tenha acesso total
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@viverdinautica.com';

-- Verifica se existem outros usuários que deveriam ser ADMIN
-- (Opcional, apenas para garantir)
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@marealta.com';

-- Garante que o plano está correto (ex: se ele escolheu um plano que limita, podemos setar para ENTERPRISE para teste)
-- UPDATE tenants SET plan = 'ENTERPRISE' WHERE id = (SELECT tenant_id FROM users WHERE email = 'admin@viverdinautica.com');

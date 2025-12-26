-- SQL para atualizar os usuários antigos (Mare Alta) para o novo padrão (Viverdi Nautica)

-- 1. Atualizar Administradores
UPDATE "public"."users" 
SET "email" = 'admin@viverdinautica.com', "name" = 'Administrador Viverdi' 
WHERE "email" = 'admin@marealta.com';

UPDATE "public"."users" 
SET "email" = 'admin.teste@viverdinautica.com', "name" = 'Administrador Viverdi Teste' 
WHERE "email" = 'admin.teste@marealta.com';

UPDATE "public"."users" 
SET "email" = 'nilsonpjr@gmail.com' -- Mantém o pessoal se desejar, ou altera também
WHERE "email" = 'nilsonpjr@gmail.com';

-- 2. Atualizar Técnicos de Teste
UPDATE "public"."users" 
SET "email" = 'tecnico1.teste@viverdinautica.com' 
WHERE "email" = 'tecnico1.teste@marealta.com';

UPDATE "public"."users" 
SET "email" = 'tecnico2.teste@viverdinautica.com' 
WHERE "email" = 'tecnico2.teste@marealta.com';

-- 3. Atualizar Clientes de Teste
UPDATE "public"."users" 
SET "email" = 'cliente1.teste@viverdinautica.com' 
WHERE "email" = 'cliente1.teste@marealta.com';

UPDATE "public"."users" 
SET "email" = 'cliente2.teste@viverdinautica.com' 
WHERE "email" = 'cliente2.teste@marealta.com';

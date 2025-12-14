
-- Ajusta a foreign key engines -> boats para deletar motores em cascata quando o barco é deletado
ALTER TABLE engines
DROP CONSTRAINT engines_boat_id_fkey;

ALTER TABLE engines
ADD CONSTRAINT engines_boat_id_fkey
FOREIGN KEY (boat_id)
REFERENCES boats (id)
ON DELETE CASCADE;

-- (Opcional) Fazer o mesmo para service_orders se quiser deletar OSs quando o barco é deletado
-- ALTER TABLE service_orders
-- DROP CONSTRAINT service_orders_boat_id_fkey;
-- ALTER TABLE service_orders
-- ADD CONSTRAINT service_orders_boat_id_fkey
-- FOREIGN KEY (boat_id)
-- REFERENCES boats (id)
-- ON DELETE CASCADE;

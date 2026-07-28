-- ============================================================
-- Migración: permite borrar categorías desde el API (por si hace
-- falta limpiar alguna en el futuro), aunque la interfaz actual no
-- tenga un botón para ello. Ejecuta esto UNA VEZ en el SQL Editor
-- de Supabase.
--
-- (Si vas a montar un proyecto de Supabase nuevo desde cero, no
-- hace falta este archivo: ya está incluido en schema.sql.)
-- ============================================================

create policy "categories_delete" on categories
  for delete using (auth.role() = 'authenticated');

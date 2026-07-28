-- ============================================================
-- Migración: permisos que faltaban para gestionar categorías desde
-- la app (crear con el botón "+ Nueva", y borrar por API si hiciera
-- falta en el futuro, aunque la interfaz actual no tenga ese botón).
--
-- Tu base de datos ya tiene la tabla "categories" creada por
-- schema.sql, pero solo tenía permiso de lectura (RLS). Ejecuta esto
-- UNA VEZ en el SQL Editor de Supabase.
--
-- (Si vas a montar un proyecto de Supabase nuevo desde cero, no
-- hace falta este archivo: ya está incluido en schema.sql.)
-- ============================================================

create policy "categories_insert" on categories
  for insert with check (auth.role() = 'authenticated');

create policy "categories_delete" on categories
  for delete using (auth.role() = 'authenticated');

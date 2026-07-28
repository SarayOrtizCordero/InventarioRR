-- ============================================================
-- Migración: permite crear categorías nuevas desde la app.
-- Tu base de datos ya tiene la tabla "categories" creada por
-- schema.sql, pero solo tenía permiso de lectura (RLS). Ejecuta
-- esto UNA VEZ en el SQL Editor de Supabase para añadir el permiso
-- de inserción que falta.
--
-- (Si vas a montar un proyecto de Supabase nuevo desde cero, no
-- hace falta este archivo: ya está incluido en schema.sql.)
-- ============================================================

create policy "categories_insert" on categories
  for insert with check (auth.role() = 'authenticated');

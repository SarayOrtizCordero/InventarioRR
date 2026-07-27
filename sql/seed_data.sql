-- ============================================================
-- Datos de ejemplo (prendas) para que la demo no se vea vacía.
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase, después de schema.sql.
-- ============================================================

-- 1. Crear los productos (la cantidad se fija en 0 aquí; el paso 2 la completa
--    mediante un movimiento de entrada, igual que haría un usuario real)
insert into products (category_id, model, size, color, quantity)
select c.id, v.model, v.size, v.color, 0
from (values
  ('Camisetas',  'Básica Cuello Redondo',   'S',  'Blanco'),
  ('Camisetas',  'Básica Cuello Redondo',   'M',  'Negro'),
  ('Camisetas',  'Manga Larga Térmica',     'L',  'Gris'),
  ('Sudaderas',  'Capucha Classic',         'M',  'Verde Bosque'),
  ('Sudaderas',  'Capucha Classic',         'L',  'Azul Marino'),
  ('Pantalones', 'Cargo Multibolsillo',     'M',  'Caqui'),
  ('Pantalones', 'Cargo Multibolsillo',     'L',  'Negro'),
  ('Polos',      'Piqué Premium',           'M',  'Blanco'),
  ('Polos',      'Piqué Premium',           'L',  'Verde Salvia'),
  ('Chaquetas',  'Softshell Impermeable',   'M',  'Negro'),
  ('Chaquetas',  'Softshell Impermeable',   'L',  'Gris Oscuro')
) as v(category, model, size, color)
join categories c on c.name = v.category;

-- 2. Registrar el stock inicial de cada producto (el trigger automático
--    de stock_movements se encarga de sumarlo a products.quantity)
insert into stock_movements (product_id, type, quantity, note)
select p.id, 'entrada', v.qty, 'Stock inicial demo'
from products p
join (values
  ('Básica Cuello Redondo', 'S', 'Blanco',       18),
  ('Básica Cuello Redondo', 'M', 'Negro',        32),
  ('Manga Larga Térmica',   'L', 'Gris',         14),
  ('Capucha Classic',       'M', 'Verde Bosque', 20),
  ('Capucha Classic',       'L', 'Azul Marino',  12),
  ('Cargo Multibolsillo',   'M', 'Caqui',        16),
  ('Cargo Multibolsillo',   'L', 'Negro',        9),
  ('Piqué Premium',         'M', 'Blanco',       22),
  ('Piqué Premium',         'L', 'Verde Salvia', 15),
  ('Softshell Impermeable', 'M', 'Negro',        7),
  ('Softshell Impermeable', 'L', 'Gris Oscuro',  5)
) as v(model, size, color, qty)
  on p.model = v.model and p.size = v.size and p.color = v.color;

-- ============================================================
-- Más prendas de ejemplo para probar el filtrado por modelo/color/talla.
-- Modelos basados en el catálogo real de Roly (marca que distribuye
-- Rodmen Rotulaciones), para que la demo sea más realista.
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase, después de
-- schema.sql y seed_data.sql.
-- ============================================================

-- 1. Nuevos productos (cantidad en 0; el paso 2 la completa vía movimiento)
insert into products (category_id, model, size, color, quantity)
select c.id, v.model, v.size, v.color, 0
from (values
  -- Camisetas
  ('Camisetas', 'Beagle', 'S', 'Blanco'),
  ('Camisetas', 'Beagle', 'M', 'Negro'),
  ('Camisetas', 'Beagle', 'L', 'Rojo'),
  ('Camisetas', 'Beagle', 'XL', 'Azul Royal'),
  ('Camisetas', 'Atomic', 'S', 'Blanco'),
  ('Camisetas', 'Atomic', 'M', 'Gris Vigoré'),
  ('Camisetas', 'Atomic', 'L', 'Negro'),
  ('Camisetas', 'Braco', 'M', 'Negro'),
  ('Camisetas', 'Braco', 'L', 'Blanco'),
  ('Camisetas', 'Braco', 'XL', 'Verde Bosque'),
  ('Camisetas', 'Stafford', 'S', 'Blanco'),
  ('Camisetas', 'Stafford', 'M', 'Negro'),

  -- Sudaderas
  ('Sudaderas', 'Urban', 'M', 'Gris'),
  ('Sudaderas', 'Urban', 'L', 'Negro'),
  ('Sudaderas', 'Urban', 'XL', 'Azul Marino'),
  ('Sudaderas', 'Aneto', 'S', 'Negro'),
  ('Sudaderas', 'Aneto', 'M', 'Gris Vigoré'),
  ('Sudaderas', 'Aneto', 'L', 'Rojo'),
  ('Sudaderas', 'Veleta', 'M', 'Negro'),
  ('Sudaderas', 'Veleta', 'L', 'Azul Marino'),

  -- Pantalones
  ('Pantalones', 'Daily', 'M', 'Negro'),
  ('Pantalones', 'Daily', 'L', 'Gris'),
  ('Pantalones', 'Daily', 'XL', 'Azul Marino'),
  ('Pantalones', 'Daily Stretch', 'S', 'Negro'),
  ('Pantalones', 'Daily Stretch', 'M', 'Gris'),
  ('Pantalones', 'Soan', 'M', 'Caqui'),
  ('Pantalones', 'Soan', 'L', 'Negro'),

  -- Polos
  ('Polos', 'Monzha', 'S', 'Blanco'),
  ('Polos', 'Monzha', 'M', 'Negro'),
  ('Polos', 'Monzha', 'L', 'Azul Marino'),
  ('Polos', 'Pegaso', 'M', 'Blanco'),
  ('Polos', 'Pegaso', 'L', 'Negro'),
  ('Polos', 'Prince', 'S', 'Verde Bosque'),
  ('Polos', 'Prince', 'M', 'Negro'),

  -- Chaquetas
  ('Chaquetas', 'Antares', 'M', 'Negro'),
  ('Chaquetas', 'Antares', 'L', 'Gris Oscuro'),
  ('Chaquetas', 'Altair', 'S', 'Negro'),
  ('Chaquetas', 'Altair', 'M', 'Azul Marino'),
  ('Chaquetas', 'Naos', 'M', 'Negro'),
  ('Chaquetas', 'Naos', 'L', 'Amarillo Flúor')
) as v(category, model, size, color)
join categories c on c.name = v.category;

-- 2. Registrar el stock inicial de cada producto nuevo (vía movimiento,
--    el trigger automático de stock_movements suma sobre products.quantity)
insert into stock_movements (product_id, type, quantity, note)
select p.id, 'entrada', v.qty, 'Stock inicial demo'
from products p
join (values
  ('Beagle', 'S', 'Blanco', 24),
  ('Beagle', 'M', 'Negro', 30),
  ('Beagle', 'L', 'Rojo', 18),
  ('Beagle', 'XL', 'Azul Royal', 12),
  ('Atomic', 'S', 'Blanco', 20),
  ('Atomic', 'M', 'Gris Vigoré', 15),
  ('Atomic', 'L', 'Negro', 10),
  ('Braco', 'M', 'Negro', 22),
  ('Braco', 'L', 'Blanco', 14),
  ('Braco', 'XL', 'Verde Bosque', 8),
  ('Stafford', 'S', 'Blanco', 16),
  ('Stafford', 'M', 'Negro', 19),

  ('Urban', 'M', 'Gris', 17),
  ('Urban', 'L', 'Negro', 21),
  ('Urban', 'XL', 'Azul Marino', 9),
  ('Aneto', 'S', 'Negro', 13),
  ('Aneto', 'M', 'Gris Vigoré', 11),
  ('Aneto', 'L', 'Rojo', 7),
  ('Veleta', 'M', 'Negro', 14),
  ('Veleta', 'L', 'Azul Marino', 10),

  ('Daily', 'M', 'Negro', 18),
  ('Daily', 'L', 'Gris', 12),
  ('Daily', 'XL', 'Azul Marino', 9),
  ('Daily Stretch', 'S', 'Negro', 11),
  ('Daily Stretch', 'M', 'Gris', 14),
  ('Soan', 'M', 'Caqui', 16),
  ('Soan', 'L', 'Negro', 8),

  ('Monzha', 'S', 'Blanco', 20),
  ('Monzha', 'M', 'Negro', 24),
  ('Monzha', 'L', 'Azul Marino', 13),
  ('Pegaso', 'M', 'Blanco', 15),
  ('Pegaso', 'L', 'Negro', 12),
  ('Prince', 'S', 'Verde Bosque', 9),
  ('Prince', 'M', 'Negro', 17),

  ('Antares', 'M', 'Negro', 10),
  ('Antares', 'L', 'Gris Oscuro', 7),
  ('Altair', 'S', 'Negro', 6),
  ('Altair', 'M', 'Azul Marino', 9),
  ('Naos', 'M', 'Negro', 5),
  ('Naos', 'L', 'Amarillo Flúor', 11)
) as v(model, size, color, qty)
  on p.model = v.model and p.size = v.size and p.color = v.color;

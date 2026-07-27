-- ============================================================
-- Amplía cada modelo/subcategoría ya existente con más tallas y colores,
-- para poder probar el filtrado con más variedad en todas las categorías.
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase, después de
-- schema.sql, seed_data.sql y seed_more_data.sql.
-- ============================================================

-- 1. Nuevas variantes (cantidad en 0; el paso 2 la completa vía movimiento)
insert into products (category_id, model, size, color, quantity)
select c.id, v.model, v.size, v.color, 0
from (values
  -- Camisetas
  ('Camisetas', 'Básica Cuello Redondo', 'L', 'Gris'),
  ('Camisetas', 'Básica Cuello Redondo', 'XL', 'Azul Marino'),
  ('Camisetas', 'Básica Cuello Redondo', 'M', 'Rojo'),
  ('Camisetas', 'Manga Larga Térmica', 'M', 'Negro'),
  ('Camisetas', 'Manga Larga Térmica', 'S', 'Blanco'),
  ('Camisetas', 'Manga Larga Térmica', 'XL', 'Azul Marino'),
  ('Camisetas', 'Beagle', 'M', 'Blanco'),
  ('Camisetas', 'Beagle', 'L', 'Negro'),
  ('Camisetas', 'Atomic', 'XL', 'Azul Marino'),
  ('Camisetas', 'Atomic', 'M', 'Rojo'),
  ('Camisetas', 'Braco', 'S', 'Negro'),
  ('Camisetas', 'Braco', 'L', 'Gris'),
  ('Camisetas', 'Stafford', 'L', 'Gris'),
  ('Camisetas', 'Stafford', 'XL', 'Azul Marino'),

  -- Sudaderas
  ('Sudaderas', 'Capucha Classic', 'S', 'Negro'),
  ('Sudaderas', 'Capucha Classic', 'XL', 'Gris'),
  ('Sudaderas', 'Urban', 'S', 'Negro'),
  ('Sudaderas', 'Urban', 'M', 'Rojo'),
  ('Sudaderas', 'Aneto', 'XL', 'Azul Marino'),
  ('Sudaderas', 'Aneto', 'M', 'Negro'),
  ('Sudaderas', 'Veleta', 'S', 'Gris'),
  ('Sudaderas', 'Veleta', 'XL', 'Negro'),

  -- Pantalones
  ('Pantalones', 'Cargo Multibolsillo', 'S', 'Gris'),
  ('Pantalones', 'Cargo Multibolsillo', 'XL', 'Azul Marino'),
  ('Pantalones', 'Daily', 'S', 'Negro'),
  ('Pantalones', 'Daily', 'M', 'Caqui'),
  ('Pantalones', 'Daily Stretch', 'L', 'Negro'),
  ('Pantalones', 'Daily Stretch', 'XL', 'Azul Marino'),
  ('Pantalones', 'Soan', 'S', 'Gris'),
  ('Pantalones', 'Soan', 'XL', 'Caqui'),

  -- Polos
  ('Polos', 'Piqué Premium', 'S', 'Negro'),
  ('Polos', 'Piqué Premium', 'XL', 'Azul Marino'),
  ('Polos', 'Monzha', 'XL', 'Blanco'),
  ('Polos', 'Monzha', 'M', 'Rojo'),
  ('Polos', 'Pegaso', 'S', 'Azul Marino'),
  ('Polos', 'Pegaso', 'XL', 'Blanco'),
  ('Polos', 'Prince', 'L', 'Blanco'),
  ('Polos', 'Prince', 'XL', 'Negro'),

  -- Chaquetas
  ('Chaquetas', 'Softshell Impermeable', 'S', 'Azul Marino'),
  ('Chaquetas', 'Softshell Impermeable', 'XL', 'Negro'),
  ('Chaquetas', 'Antares', 'S', 'Negro'),
  ('Chaquetas', 'Antares', 'XL', 'Azul Marino'),
  ('Chaquetas', 'Altair', 'L', 'Negro'),
  ('Chaquetas', 'Altair', 'XL', 'Gris Oscuro'),
  ('Chaquetas', 'Naos', 'S', 'Negro'),
  ('Chaquetas', 'Naos', 'XL', 'Amarillo Flúor')
) as v(category, model, size, color)
join categories c on c.name = v.category;

-- 2. Registrar el stock inicial de cada variante nueva
insert into stock_movements (product_id, type, quantity, note)
select p.id, 'entrada', v.qty, 'Stock inicial demo'
from products p
join (values
  ('Básica Cuello Redondo', 'L', 'Gris', 13),
  ('Básica Cuello Redondo', 'XL', 'Azul Marino', 9),
  ('Básica Cuello Redondo', 'M', 'Rojo', 11),
  ('Manga Larga Térmica', 'M', 'Negro', 14),
  ('Manga Larga Térmica', 'S', 'Blanco', 10),
  ('Manga Larga Térmica', 'XL', 'Azul Marino', 7),
  ('Beagle', 'M', 'Blanco', 16),
  ('Beagle', 'L', 'Negro', 13),
  ('Atomic', 'XL', 'Azul Marino', 8),
  ('Atomic', 'M', 'Rojo', 12),
  ('Braco', 'S', 'Negro', 9),
  ('Braco', 'L', 'Gris', 10),
  ('Stafford', 'L', 'Gris', 11),
  ('Stafford', 'XL', 'Azul Marino', 7),

  ('Capucha Classic', 'S', 'Negro', 9),
  ('Capucha Classic', 'XL', 'Gris', 6),
  ('Urban', 'S', 'Negro', 8),
  ('Urban', 'M', 'Rojo', 7),
  ('Aneto', 'XL', 'Azul Marino', 6),
  ('Aneto', 'M', 'Negro', 10),
  ('Veleta', 'S', 'Gris', 9),
  ('Veleta', 'XL', 'Negro', 7),

  ('Cargo Multibolsillo', 'S', 'Gris', 8),
  ('Cargo Multibolsillo', 'XL', 'Azul Marino', 6),
  ('Daily', 'S', 'Negro', 9),
  ('Daily', 'M', 'Caqui', 11),
  ('Daily Stretch', 'L', 'Negro', 10),
  ('Daily Stretch', 'XL', 'Azul Marino', 7),
  ('Soan', 'S', 'Gris', 8),
  ('Soan', 'XL', 'Caqui', 9),

  ('Piqué Premium', 'S', 'Negro', 10),
  ('Piqué Premium', 'XL', 'Azul Marino', 8),
  ('Monzha', 'XL', 'Blanco', 9),
  ('Monzha', 'M', 'Rojo', 11),
  ('Pegaso', 'S', 'Azul Marino', 7),
  ('Pegaso', 'XL', 'Blanco', 9),
  ('Prince', 'L', 'Blanco', 8),
  ('Prince', 'XL', 'Negro', 10),

  ('Softshell Impermeable', 'S', 'Azul Marino', 6),
  ('Softshell Impermeable', 'XL', 'Negro', 5),
  ('Antares', 'S', 'Negro', 5),
  ('Antares', 'XL', 'Azul Marino', 7),
  ('Altair', 'L', 'Negro', 6),
  ('Altair', 'XL', 'Gris Oscuro', 4),
  ('Naos', 'S', 'Negro', 4),
  ('Naos', 'XL', 'Amarillo Flúor', 6)
) as v(model, size, color, qty)
  on p.model = v.model and p.size = v.size and p.color = v.color;

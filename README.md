# Inventario de Ropa — Demo

Panel web para gestionar el inventario de productos de ropa por categorías, con ajustes de stock automáticos (nunca se edita la cantidad a mano) e historial de movimientos.

## Stack

- Frontend: HTML5 + CSS3 + JavaScript (sin frameworks, sin build step).
- Backend/DB: [Supabase](https://supabase.com) (Postgres + Auth). Gratis para este uso.
- Hosting: GitHub Pages.

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta / un nuevo proyecto (elige una contraseña de base de datos y guárdala).
2. Ve a **SQL Editor** → pega todo el contenido de [`sql/schema.sql`](sql/schema.sql) → **Run**. Esto crea las tablas, el trigger de stock automático, las políticas de seguridad (RLS) y las 5 categorías fijas.
3. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public` key
4. Abre [`js/supabaseClient.js`](js/supabaseClient.js) y reemplaza `SUPABASE_URL` y `SUPABASE_ANON_KEY` con esos valores.

## 2. Crear los dos usuarios de prueba

1. Ve a **Authentication → Users → Add user** y crea dos cuentas (ej. `jefe@demo.com` y `mano@demo.com`) con contraseña.
2. Copia el `UID` de cada usuario creado.
3. Ve a **SQL Editor** y ejecuta (una vez por usuario):

```sql
insert into profiles (id, full_name, role)
values ('UID-DEL-JEFE', 'Nombre del Jefe', 'jefe');

insert into profiles (id, full_name, role)
values ('UID-DE-LA-MANO-DERECHA', 'Nombre Mano Derecha', 'mano_derecha');
```

## 3. (Opcional) Cargar prendas de ejemplo

Para que el dashboard no se vea vacío en la demo, ve a **SQL Editor** y ejecuta el contenido de [`sql/seed_data.sql`](sql/seed_data.sql). Crea 11 prendas de ejemplo repartidas en las 5 categorías, con su stock inicial ya registrado como movimiento. Ejecútalo una sola vez (no está pensado para correr dos veces, duplicaría los productos).

Para tener más variedad de modelos, tallas y colores con los que probar el filtrado (útil para ver la vista de modelos/subcategorías en acción), ejecuta también [`sql/seed_more_data.sql`](sql/seed_more_data.sql). Añade ~40 variantes más repartidas en varios modelos por categoría (basados en nombres reales del catálogo Roly), también pensado para ejecutarse una sola vez.

Para que **cada modelo** (incluidos los originales) tenga más tallas y colores donde probar los filtros, ejecuta también [`sql/seed_variants_expansion.sql`](sql/seed_variants_expansion.sql). Añade ~46 variantes más repartidas entre todos los modelos ya existentes.

## 4. Probar en local

Abre `index.html` con una extensión tipo "Live Server" (VS Code) o cualquier servidor estático local (no funciona con doble clic directo por CORS del navegador). Inicia sesión con cualquiera de las dos cuentas creadas.

## 5. Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Demo panel de inventario"
git branch -M main
git remote add origin <URL-DE-TU-REPO>
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: rama `main`, carpeta `/root`** → Guardar. La URL pública tardará uno o dos minutos en activarse.

> Si Supabase rechaza las peticiones desde la URL de GitHub Pages, ve a **Authentication → URL Configuration** en Supabase y añade esa URL a los orígenes permitidos.

## Funcionalidades incluidas

- Login con roles (jefe / mano derecha).
- Categorías fijas: Camisetas, Sudaderas, Pantalones, Polos, Chaquetas.
- Añadir producto (modelo, talla, color, cantidad inicial).
- Sumar / restar stock con botones rápidos (registra un movimiento, nunca edita la cantidad directamente).
- Eliminar producto.
- Historial de movimientos, global o por producto.

## Fuera de alcance en esta demo

- Alta de nuevos usuarios desde la app (se crean manualmente en Supabase).
- Reportes o exportación de datos.
- Imágenes de producto.

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

## 3. Si ya tenías el proyecto creado antes: habilitar categorías nuevas

Si tu base de datos ya existía antes de esta versión, ve a **SQL Editor** y ejecuta [`sql/migration_categories_rls.sql`](sql/migration_categories_rls.sql). Añade los permisos que faltan para crear categorías nuevas desde la app (el botón "+ Nueva" junto a las pestañas) y para poder borrar alguna por API si hiciera falta más adelante. Si estás montando el proyecto desde cero, no hace falta: ya está incluido en `schema.sql`.

## 4. (Opcional) Cargar prendas de ejemplo

Para que el dashboard no se vea vacío en la demo, ve a **SQL Editor** y ejecuta el contenido de [`sql/seed_data.sql`](sql/seed_data.sql). Crea 97 prendas de ejemplo repartidas en 19 modelos (basados en el catálogo real de Roly) dentro de las 5 categorías, cada una con varias tallas y colores para poder probar el filtrado de la vista de modelos/variantes, con su stock inicial ya registrado como movimiento. Ejecútalo una sola vez (no está pensado para correr dos veces, duplicaría los productos).

## 5. Probar en local

Abre `index.html` con una extensión tipo "Live Server" (VS Code) o cualquier servidor estático local (no funciona con doble clic directo por CORS del navegador). Inicia sesión con cualquiera de las dos cuentas creadas.

## 6. Publicar en GitHub Pages

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
- Categorías: Camisetas, Sudaderas, Pantalones, Polos, Chaquetas de partida, y se pueden añadir nuevas con el botón "+ Nueva".
- Añadir producto (categoría, modelo/subcategoría, talla, color, cantidad inicial), con opción de crear modelo/talla/color nuevos sobre la marcha.
- Sumar / restar stock con botones rápidos (registra un movimiento, nunca edita la cantidad directamente).
- Eliminar producto.
- Historial de movimientos, global o por producto.

## Fuera de alcance en esta demo

- Alta de nuevos usuarios desde la app (se crean manualmente en Supabase).
- Reportes o exportación de datos.
- Imágenes de producto.

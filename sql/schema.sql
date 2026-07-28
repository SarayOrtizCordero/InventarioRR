-- ============================================================
-- Esquema de base de datos: Panel de Inventario de Ropa (demo)
-- Ejecutar completo en el SQL Editor de Supabase
-- ============================================================

-- 1. Categorías (fijas)
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null unique
);

insert into categories (name)
values ('Camisetas'), ('Sudaderas'), ('Pantalones'), ('Polos'), ('Chaquetas')
on conflict (name) do nothing;

-- 2. Perfiles de usuario (jefe / mano_derecha)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('jefe', 'mano_derecha')),
  created_at timestamptz not null default now()
);

-- 3. Productos
create table if not exists products (
  id bigint generated always as identity primary key,
  category_id bigint not null references categories (id),
  model text not null,
  size text not null,
  color text not null,
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now()
);

-- 4. Movimientos de stock (entradas/salidas)
create table if not exists stock_movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references products (id) on delete cascade,
  type text not null check (type in ('entrada', 'salida')),
  quantity integer not null check (quantity > 0),
  user_id uuid references profiles (id),
  note text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Trigger: aplicar el movimiento automáticamente sobre products.quantity
-- ============================================================
create or replace function apply_stock_movement()
returns trigger as $$
begin
  if new.type = 'entrada' then
    update products set quantity = quantity + new.quantity where id = new.product_id;
  else
    update products set quantity = quantity - new.quantity where id = new.product_id;
    if (select quantity from products where id = new.product_id) < 0 then
      raise exception 'Stock insuficiente para este producto';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_apply_stock_movement on stock_movements;
create trigger trg_apply_stock_movement
  after insert on stock_movements
  for each row execute function apply_stock_movement();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table categories enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;

-- Categorías: cualquier usuario autenticado puede leer, crear y borrar
create policy "categories_select" on categories
  for select using (auth.role() = 'authenticated');
create policy "categories_insert" on categories
  for insert with check (auth.role() = 'authenticated');
create policy "categories_delete" on categories
  for delete using (auth.role() = 'authenticated');

-- Perfiles: cualquier autenticado puede leer todos los perfiles
create policy "profiles_select" on profiles
  for select using (auth.role() = 'authenticated');

-- Perfiles: cada usuario puede actualizar su propio perfil,
-- y un 'jefe' puede actualizar el de cualquiera (gestión de usuarios futura)
create policy "profiles_update" on profiles
  for update using (
    auth.uid() = id
    or exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'jefe'
    )
  );

-- Productos: cualquier autenticado puede leer/crear/editar/borrar
create policy "products_select" on products
  for select using (auth.role() = 'authenticated');
create policy "products_insert" on products
  for insert with check (auth.role() = 'authenticated');
create policy "products_update" on products
  for update using (auth.role() = 'authenticated');
create policy "products_delete" on products
  for delete using (auth.role() = 'authenticated');

-- Movimientos de stock: cualquier autenticado puede leer/crear
create policy "stock_movements_select" on stock_movements
  for select using (auth.role() = 'authenticated');
create policy "stock_movements_insert" on stock_movements
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- Nota: crear las 2 cuentas de prueba en Authentication > Users,
-- y luego insertar su fila correspondiente en "profiles", ej:
--
-- insert into profiles (id, full_name, role)
-- values ('<uuid-del-usuario>', 'Nombre Jefe', 'jefe');
-- ============================================================

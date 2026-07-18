-- Control de acceso al álbum: solo entran los correos previamente invitados.
create table public.invitados (
  email text primary key,
  nota text,
  creado_en timestamptz not null default now()
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  nombre text,
  rol text not null default 'familiar' check (rol in ('propietario', 'familiar')),
  creado_en timestamptz not null default now()
);

alter table public.invitados enable row level security;
alter table public.perfiles enable row level security;

create or replace function public.es_propietario()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'propietario');
$$;

create or replace function public.crear_perfil_si_invitado()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare invitado public.invitados%rowtype;
begin
  select * into invitado from public.invitados where lower(email) = lower(new.email);
  if not found then
    raise exception 'Este correo no está invitado al álbum.' using errcode = '42501';
  end if;
  insert into public.perfiles (id, email, rol)
  values (new.id, lower(new.email),
    case when lower(new.email) = 'carlossaiz@me.com' then 'propietario' else 'familiar' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_si_invitado();

create policy "perfiles: cada uno ve el suyo" on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_propietario());
create policy "perfiles: cada uno edita el suyo" on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "invitados: solo el propietario los consulta" on public.invitados for select to authenticated
  using (public.es_propietario());
create policy "invitados: solo el propietario invita" on public.invitados for insert to authenticated
  with check (public.es_propietario());
create policy "invitados: solo el propietario retira invitaciones" on public.invitados for delete to authenticated
  using (public.es_propietario());

-- Endurecido: las funciones no se exponen por la API REST.
revoke execute on function public.crear_perfil_si_invitado() from public, anon, authenticated;
grant execute on function public.crear_perfil_si_invitado() to supabase_auth_admin;
revoke execute on function public.es_propietario() from public, anon;
grant execute on function public.es_propietario() to authenticated;

# Álbum de Tavi

Álbum de fotos privado. Next.js 14 (App Router) + TypeScript + Tailwind + Supabase Auth.

## Puesta en marcha

1. `npm install`
2. Copia `.env.example` a `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `npm run dev`

## Acceso

Entrada por correo y contraseña. No hay registro abierto: las cuentas se crean
a mano desde el panel de Supabase (Authentication → Users → Add user, con
"Auto Confirm User" activado).

Todas las rutas están protegidas por `src/middleware.ts` salvo `/login` y
`/auth`. Sin sesión, cualquier ruta redirige a `/login?siguiente=…`.

## Estructura

- `src/lib/supabase/` — clientes de navegador, servidor y middleware.
- `src/app/login/` — página de entrada, formulario y server actions.
- `src/app/page.tsx` — inicio protegido (aún vacío).

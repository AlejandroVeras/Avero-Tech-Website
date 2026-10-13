# Auditoría del ecosistema Avero — octubre 2026

Revisión del 13 de octubre de 2026 de averotechnology.com, inventario, citas y condominios: dominios, código, seguridad y SEO.

## Dominios (estado final)

| Dominio | Proyecto Vercel | Sirve | Estado |
|---|---|---|---|
| averotechnology.com | averotech-website | Sitio, catálogo, /sistemas, precios, /admin | ✅ principal |
| www.averotechnology.com | averotech-website | 308 → averotechnology.com | ✅ |
| inventario.averotechnology.com | averotech-website (mismo código, separado en `proxy.ts`) | login, signup, dashboard, tiendas /t/ | ✅ |
| citas.averotechnology.com | avero-citas | Avero Citas | ✅ |
| condominios.averotechnology.com | avero-condominios | Avero Condominios | ✅ |

Las cuatro tarjetas de /sistemas responden 200: Gestión → ficha /sistemas/gestion → inventario, más Condominios y Citas.

## Lo que se arregló

1. **El dominio sin www no abría.** Ahora es el principal y www redirige a él. Esto cuadra con SITE_URL, el sitemap y las URL canónicas.
2. **condominios.averotechnology.com no resolvía.** El DNS ya está propagado y tiene SSL.
3. **Nuevo inventario.averotechnology.com**, separado por dominio en `proxy.ts`:
   - Las rutas del sistema (/login, /signup, /dashboard y /t) en el dominio principal redirigen con 308 a inventario.
   - El resto de rutas abiertas en inventario vuelven al dominio principal.
   - La sesión se comparte con `NEXT_PUBLIC_COOKIE_DOMAIN=.averotechnology.com`, así que /admin sigue funcionando tras entrar por inventario. Al volver del login se regresa a /admin con `?next=`.
4. **Supabase del sitio:** el Site URL era `http://localhost:3000`, así que los correos de confirmación de cuenta llevaban a localhost. Ahora apunta a inventario, y las Redirect URLs incluyen los dos dominios y localhost.
5. **Supabase de Citas y Condominios:**
   - El Site URL era `localhost:3000`; ahora es condominios.
   - Las Redirect URLs incluyen los dos subdominios y localhost:3001 y 3002.
6. **Avero Citas en /sistemas:** se publicó con `DATABASE_CITAS_SYSTEM.sql`.
7. **Variable `NEXT_PUBLIC_SITE_URL` de Citas:** era la dirección de vercel.app; ahora es citas.averotechnology.com.
8. **Enlaces a inventario.** Ahora apuntan ahí:
   - el aviso del fin de la prueba;
   - los enlaces para compartir tiendas y productos;
   - los botones "Probar gratis" y "Mi cuenta";
   - los enlaces de /admin a tiendas y dashboard.
9. **Robots y sitemap separados por dominio.** Las tiendas de los clientes se indexan desde inventario.
10. **Citas:**
    - El cron apunta al dominio final.
    - Se agregaron robots y sitemap.
    - El enlace de "te extrañamos" de los reportes usa SITE_URL.

## Pendiente de ti

- [ ] **Cron de mensajes de Citas.** En Supabase (proyecto Avero Condominios) → SQL Editor ya está cargado el 0003:
  1. Pega el contenido de `avero-citas/tests/.out/cron-secret.txt` donde dice `PEGA_AQUI_EL_CRON_SECRET`.
  2. Dale a Run.
- [ ] **Webhook de PayPal.** Si estaba registrado con `www.averotechnology.com/api/webhooks/paypal`, sigue funcionando porque /api responde en los dos dominios. Aun así, conviene cambiarlo a `https://averotechnology.com/api/webhooks/paypal` en developer.paypal.com.
- [ ] **Antes de clientes reales:**
  - Activar **Confirm email** en Supabase.
  - Configurar el SMTP de Resend con el dominio.
  - Borrar las cuentas qa-*.
- [ ] **Turnstile (anti-bots) en las reservas públicas de Citas.** Crea las llaves gratis en Cloudflare y ponlas en Vercel: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET`.
- [ ] **Correo info@averotechnology.com.** Namecheap tiene "Email Forwarding" activo; confirma que reenvía a tu Gmail.
- [ ] **Condominios en /sistemas** sigue como "próximamente". Cámbialo en /admin/sistemas cuando quieras venderlo.

## Hallazgos para la próxima ronda (no se tocaron)

| Severidad | Dónde | Qué |
|---|---|---|
| Alta | Supabase del sitio | La tabla `payments` (abonos de facturas) no tiene CREATE TABLE ni RLS en ningún .sql del repo. Hay que confirmar en Supabase que tiene RLS por dueño. |
| Media | `lib/data/payments.ts` | `createPayment` no valida montos (negativos o enormes) y confía solo en RLS. `financing-payments.ts` actualiza `financing_used` leyendo y escribiendo, y puede pisarse con otra operación. |
| Media | `components/signup-form.tsx` | `signUp` sin `emailRedirectTo` y sin ruta /auth/callback. Hoy funciona porque el Site URL ya es inventario. |
| Media | Citas y Condominios | Comparten proyecto de Supabase, así que hay un solo Site URL y una sola plantilla de correo. Condominios entra con código OTP (bien); si algún día se usa enlace mágico en Citas, hay que pasar `emailRedirectTo`. |
| Baja | Las tres apps | Faltan cabeceras de seguridad (HSTS, frame-ancestors) en `next.config`. |
| Baja | Sitio | `eslint` no está instalado (`pnpm lint` falla). `@supabase/supabase-js` está en `latest`. El paquete se llama `my-v0-project`. Las fuentes Geist se cargan pero no se usan. |
| Baja | Citas y Condominios | Falta imagen Open Graph y JSON-LD. En Citas, cada página de negocio podría llevar `LocalBusiness` con dirección y teléfono, que ayuda en Google Maps. |
| Baja | Citas y Condominios | El logo en el encabezado lleva a `/` de cada app. Solo la portada enlaza a averotechnology.com. |

## Verificación

- `tsc --noEmit` sin errores en las tres apps.
- Pruebas de Citas: 16/16 unitarias y 74/74 de base de datos. Condominios: 17/17.
- `curl` a cada dominio y ruta clave: códigos y redirecciones esperados, HTTPS válido.

# Prompt: pulido visual, inglés/español, HubSpot y salida a producción

Copia todo lo que está debajo de la línea y pégalo en una sesión nueva de Claude Code, abierta en la carpeta del repo `Avero-Tech-Website`.

---

## Rol

Actúa como un equipo en una sola persona: diseñador de producto senior, desarrollador frontend senior (Next.js 16 App Router, Tailwind v4, shadcn/ui, Supabase, Vercel), especialista en internacionalización y SEO, e ingeniero de QA. Trabajas para Avero Technology (averotechnology.com), empresa de tecnología de Santo Domingo, República Dominicana. El dueño es Alejandro Veras.

## Objetivo

Dejar averotechnology.com listo para producción en cuatro frentes:

1. **Pulido visual:** revisar la página completa y mejorar todo lo que pueda verse u organizarse mejor, sin cambiar la identidad del sitio.
2. **Inglés y español:** un selector de idioma con el sitio traducido al inglés.
3. **CRM:** que los formularios de contacto envíen cada contacto a HubSpot.
4. **Producción:** auditoría final de seguridad, SEO, rendimiento y limpieza.

## Estado actual (léelo antes de tocar nada)

- **Ramas:** el trabajo vive en `feature/seo-llmo-site`, que está igual que `main` (commit `e1d75f8`), ya desplegado en Vercel. Crea `feature/pulido-i18n-crm` desde ahí.
- **Páginas públicas** en `app/(site)/`: portada, `/servicios` y 6 servicios, `/sistemas` y 3 fichas (inventario, citas, condominios), `/catalogo` y sus fichas, `/precios`, `/nosotros`, `/preguntas-frecuentes`, `/blog` (sin artículos), `/contacto`, y las legales.
- **Diseño:** las páginas de contenido se pintan desde datos con `components/site/blocks/content-page.tsx` y los bloques de `components/site/blocks/`. La portada tiene un hero con globo 3D (`components/site/home/`). Los tokens están en `app/globals.css`. El encabezado, el pie y el contenido comparten el ancho `max-w-6xl`: no rompas esa alineación.
- **Datos pendientes:** `lib/business.ts` guarda precios y datos sin confirmar como `null`; la web muestra «Cotiza sin costo» y oculta lo que depende de ellos. Ese mecanismo se mantiene.
- **Formularios públicos:** solo existe `components/site/support-form.tsx` (en `/servicios/soporte-tecnico`), que guarda en Supabase con `lib/data/support.ts` y tiene un campo trampa contra spam. `/contacto` no tiene formulario: solo WhatsApp y correo.
- **Idioma:** todo está en español, con `lang="es"` fijo y los textos escritos dentro de cada página. No hay ninguna librería de traducción.
- **Bot de WhatsApp:** desde el 11 de noviembre de 2026 el bot corre en Kapso, fuera de este repo, con un modelo de Claude. El código de `app/api/webhooks/whatsapp`, `lib/ai/` y la burbuja de chat (`CHAT_ENABLED`) sigue en el repo, pero no está en uso. **Ojo:** varias páginas describen el asistente con datos de la simulación anterior (modelos de OpenAI, US$0.0046 por 10 conversaciones, 3.8 s). Ver la Fase 0.
- **Otros repos:** Citas y Condominios son apps aparte (`avero-citas`, `avero-condominios`). No se tocan en este encargo.
- **Documentos de referencia:** `docs/contenido/00-estrategia-seo-llmo.docx` (arquitectura y voz), `99-implementacion-tecnica.docx` (SEO técnico) y `docs/QA-UIUX-2026-10.md`. En macOS se leen con `textutil -convert txt -stdout <archivo>`.

## Fase 0: auditoría (entrega antes de cambiar código)

Recorre el sitio completo en local (`npm run dev`) y en producción, en 390, 768, 1024 y 1440 px, en tema claro y oscuro. Entrégame un informe corto en `docs/AUDITORIA-PULIDO-2026-11.md` con:

1. **Hallazgos visuales** por página, con captura, ordenados por impacto: jerarquía, espaciado, alineación, consistencia entre páginas, estados vacíos, hover y foco, tablas en celular, modo oscuro.
2. **Hallazgos de contenido:** textos desactualizados o que se contradicen. Revisa en especial lo que se dice del asistente de WhatsApp frente a cómo funciona hoy en Kapso. No lo corrijas por tu cuenta: lista cada frase y pregúntame qué es cierto ahora.
3. **Hallazgos técnicos:** código sin uso (por ejemplo el webhook de WhatsApp y los archivos `placeholder*` de `public/`), dependencias sin usar, avisos de lint, variables de entorno que sobran o faltan en `.env.example`.
4. **Propuesta de mejoras** priorizada (alta, media, baja), con el esfuerzo de cada una.

Para y espera mi visto bueno antes de la Fase 1.

## Fase 1: pulido visual

Aplica las mejoras aprobadas. Reglas:

- **Mantén la identidad:** fondo claro, tarjetas redondeadas, un solo azul de acción (#0071e3), tipografía grande, hero oscuro con el globo en la portada. No añadas colores ni fuentes.
- **Mejora, no rediseñes:** ritmo vertical parejo entre secciones, una jerarquía clara por pantalla, menos repetición del mismo bloque seguido, y microinteracciones discretas que respeten `prefers-reduced-motion`.
- **Ideas a evaluar en la auditoría** (aplícalas solo si mejoran de verdad):
  - un índice lateral fijo («En esta página») en las páginas de servicio largas, en escritorio;
  - una barra de acción fija en celular con «WhatsApp» y «Cotizar»;
  - capturas reales de Avero Inventario, Citas y Condominios en sus fichas, con cuentas y datos de demostración;
  - estados vacíos y de error con el mismo estilo (404, catálogo sin resultados, blog sin artículos).
- **Imágenes:** primero capturas reales del trabajo de Avero, después ilustraciones hechas con código. Fotos de internet solo con licencia libre verificada, registradas en `docs/image-credits.md`. Nunca personas de stock presentadas como el equipo o como clientes.
- **Textos:** no cambies el contenido aprobado. Si un texto no cabe o sobra, pregúntame.

## Fase 2: inglés y español

El público principal es dominicano, así que el español sigue siendo el idioma por defecto. El inglés es para clientes de Estados Unidos y la diáspora.

- **Arquitectura:** español en las URLs actuales, sin prefijo, e inglés bajo `/en/…`. Ninguna URL en español cambia, para no perder el posicionamiento. Usa `next-intl` (versión fija, verifica que soporte Next.js 16) o un diccionario propio si resulta más simple; justifica la elección en el informe.
- **Sin redirecciones automáticas por idioma del navegador.** Si el navegador está en inglés, muestra un aviso discreto que ofrezca la versión en inglés. La elección se recuerda en una cookie.
- **Selector de idioma** «ES | EN» en el encabezado (y en el menú móvil), accesible por teclado, que lleve a la misma página en el otro idioma y no rompa la simetría de la barra.
- **Qué se traduce:** portada, servicios y sus 6 páginas, sistemas y sus 3 fichas, precios, nosotros, preguntas frecuentes, contacto, encabezado, pie, formularios, mensajes de error, metadatos, imágenes Open Graph y JSON-LD. El catálogo traduce la interfaz; los nombres y descripciones de productos vienen de la base de datos y se quedan en español. Las páginas legales se quedan solo en español, con una nota en inglés que lo diga.
- **Cómo se traduce:** saca los textos de las páginas a archivos por idioma (`content/es/…` y `content/en/…`), de modo que cada página tenga una sola estructura y dos juegos de textos. Las traducciones al inglés las escribes tú, en inglés natural de negocios de Estados Unidos, sin traducir literalmente. Los precios siguen en RD$ y los planes en US$. Marca cada archivo en inglés como «pendiente de revisión» hasta que yo lo apruebe.
- **No traducción automática en el navegador:** nada de widgets tipo Google Translate. Dañan el SEO y la calidad.
- **SEO:** `hreflang` (`es`, `en` y `x-default` hacia español) en cada página con versión en los dos idiomas, canonical propio por idioma, `lang` correcto en `<html>`, sitemap con las alternativas, `inLanguage` en el JSON-LD, y títulos y metas en inglés de 60 y 155 caracteres como máximo. Añade `llms.txt` en inglés si no complica el script `scripts/build-llms.mjs`.
- **Lo que no se rompe:** `lib/business.ts` sigue funcionando en los dos idiomas («Free quote» donde hoy dice «Cotiza sin costo»), y los enlaces de WhatsApp llevan el mensaje prellenado en el idioma de la página.

## Fase 3: formularios y HubSpot

- **Formulario de contacto nuevo** en `/contacto` (y un bloque reutilizable para el final de las páginas de servicio): nombre, correo, teléfono o WhatsApp, empresa (opcional), servicio de interés (lista con los 6 servicios, sistemas y equipos), mensaje, y una casilla de consentimiento con enlace a `/privacidad`. WhatsApp sigue siendo la acción principal de la página; el formulario es la alternativa.
- **Envío:** una acción de servidor que, en este orden:
  1. valida con zod y descarta spam (campo trampa y límite de envíos por IP, como hace `lib/data/support.ts`);
  2. guarda el contacto en Supabase (tabla `contact_leads`, con SQL idempotente y RLS solo para administradores, al estilo de los `DATABASE_*.sql` del repo), para no perder nada si HubSpot falla;
  3. envía el contacto a HubSpot;
  4. avisa a Alejandro por correo con Resend, que ya está configurado.
- **Integración con HubSpot:** usa la API de envío de formularios (Forms Submissions API v3) desde el servidor, con el `portalId` y el `formGuid` en variables de entorno. Incluye el contexto (`pageUri`, `pageName` y la cookie `hubspotutk` si existe) y el consentimiento. Si esa vía no alcanza para algún campo, usa la API de contactos con el token de una app privada. El token nunca llega al navegador.
- **El formulario de soporte actual** envía también a HubSpot, con el tipo de problema como propiedad.
- **Propiedades a mapear:** nombre, correo, teléfono, empresa, servicio de interés, mensaje, idioma de la página, URL de origen y UTM si los hay. Lista en el informe las propiedades personalizadas que hay que crear en HubSpot.
- **Si HubSpot falla:** el usuario ve igual el mensaje de éxito, el contacto queda en Supabase marcado como «sin sincronizar» y un reintento lo envía después (un cron de Vercel, como el que ya existe en `app/api/cron/`).
- **Script de seguimiento de HubSpot:** no lo instales sin preguntarme. Si lo apruebo, se carga solo con consentimiento de cookies, y hay que actualizar la política de privacidad y la cabecera CSP de `next.config.mjs`.
- **Privacidad (Ley 172-13):** añade a `/privacidad` que los datos de contacto se guardan en un CRM. Prepara el texto y espera mi aprobación antes de publicarlo.
- **Credenciales:** no tengo cuenta de HubSpot conectada al repo. Dime exactamente qué crear (cuenta gratuita, formulario, app privada y sus permisos) y qué variables poner en Vercel. Tú no creas cuentas ni escribes credenciales: deja `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_GUID_CONTACTO`, `HUBSPOT_FORM_GUID_SOPORTE` y `HUBSPOT_ACCESS_TOKEN` documentadas en `.env.example`. Sin esas variables, el formulario funciona igual y guarda solo en Supabase.
- **Pruebas:** tests unitarios de la validación, del mapeo a HubSpot y del camino de fallo, con la API simulada. La prueba real contra HubSpot se hace cuando yo ponga las credenciales, con un contacto de prueba que después se borra.

## Fase 4: lista de salida a producción

- **Limpieza:** con mi aprobación, quita el código sin uso que salió en la Fase 0. No borres nada del dashboard, del admin ni de la facturación.
- **Seguridad:** revisa las cabeceras de `next.config.mjs`, que ninguna clave secreta llegue al cliente, la RLS de las tablas nuevas, el límite de envíos de los formularios y que `app/api/dev/*` siga respondiendo 404 en producción.
- **SEO:** sitemap y robots correctos en los dos idiomas, un solo H1 por página, títulos y metas dentro de límite, JSON-LD válido en [validator.schema.org](https://validator.schema.org/) y las preguntas del `FAQPage` idénticas a las visibles.
- **Rendimiento:** Lighthouse móvil en la portada, `/servicios`, una página de servicio y `/en`. Metas: rendimiento de 90 o más, accesibilidad y SEO en 100, LCP de 2.5 s o menos y CLS de 0.1 o menos. La portada mide hoy 97, con LCP de 2.5 s; no puede empeorar.
- **Analítica:** el sitio solo tiene Vercel Analytics. Deja preparado GA4 y el evento `whatsapp_click`, detrás del consentimiento de cookies, y actívalo solo si te doy el ID.
- **QA completo:** `npm run lint`, `npm test` y `npm run build` sin errores. Corre `node scripts/qa/run.mjs` con las páginas en inglés añadidas: 0 enlaces rotos, 0 desbordes y 0 errores de la página. Después prueba a mano en Chrome el selector de idioma, los dos formularios, el mega menú, el menú «Entrar» y el carrito.
- **Sin marcadores:** `rg "\[(DATO REAL|PRECIO|CASO REAL|X)\b"` no debe encontrar nada en `app/`, `components/`, `lib/`, `content/` ni `public/`.
- **Documentación:** actualiza `.env.example` y el README con las variables nuevas y cómo añadir o corregir una traducción.

## Reglas de trabajo

- Trabaja por fases. Al terminar cada una, para, muéstrame capturas (390 y 1440 px, claro y oscuro) y un resumen corto: qué hiciste, qué decidiste y por qué, resultados de las pruebas y qué necesitas de mí.
- No inventes clientes, testimonios, cifras, precios ni casos. Lo que no sepas, pregúntalo.
- Commits en inglés, con una idea por commit. Sube la rama para tener vista previa en Vercel, pero no la pases a `main` sin mi permiso explícito.
- No toques `/dashboard`, `/admin`, la facturación con PayPal ni los repos de Citas y Condominios.
- Cualquier cambio en textos legales o de privacidad espera mi aprobación.

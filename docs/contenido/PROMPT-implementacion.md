# Prompt: montar el contenido nuevo en averotechnology.com

Copia todo lo que está debajo de la línea y pégalo en una sesión nueva de Claude Code, abierta en la carpeta del repo `Avero-Tech-Website`.

---

## Rol

Actúa como desarrollador frontend senior y diseñador de producto. Vas a implementar en el sitio de Avero Technology (Next.js 16 App Router, Tailwind v4, shadcn/ui, framer-motion, Supabase, Vercel) el contenido aprobado que está en `docs/contenido/`. El resultado debe verse como una extensión natural del sitio actual, con el mismo cuidado visual, y no como una plantilla genérica de agencia.

## Antes de escribir código

1. Crea la rama `feature/seo-llmo-site` desde `content/seo-llmo-2026-11`.
2. Lee los documentos de `docs/contenido/`. En macOS se convierten a texto así: `textutil -convert txt -stdout docs/contenido/03-servicio-paginas-web.docx`. Orden de lectura:
   - `00-estrategia-seo-llmo.docx`: arquitectura, menú, pie y redirecciones aprobadas.
   - `99-implementacion-tecnica.docx`: orden de implementación y detalles técnicos. Síguelo.
   - `01` a `19`: el contenido final de cada página. Los recuadros «Diseño:» son las instrucciones de maquetación de cada bloque.
   - `20-llms-txt.docx`, `llms.txt` y `llms-full.txt`.
3. Estudia el estilo actual antes de diseñar nada nuevo:
   - `app/globals.css`: tokens de color y escala tipográfica.
   - `app/(site)/page.tsx`: mosaico de la portada, bloques de pasos y banda de CTA final.
   - `app/(site)/sistemas/[slug]/page.tsx`: hero oscuro, tarjetas de funciones y planes.
   - `components/site/section-heading.tsx`, `components/site/home/hero.tsx` y `components/site/home/device-mockups.tsx` (`LaptopMock`, `PhoneMock`).
   - `components/site/faq.tsx`, `plan-card.tsx`, `site-header.tsx` y `site-footer.tsx`.
4. Arranca el sitio con `npm run dev` y toma capturas de la portada, `/sistemas/gestion` y `/precios` en 390 px y 1440 px, en tema claro y oscuro. Son tu referencia visual.

## Estilo visual que debes respetar

El sitio tiene un estilo sobrio, inspirado en Apple: mucho aire, tipografía grande y un solo color de acción. Mantenlo así.

- **Colores:**
  - fondo `--background` (#f5f5f7);
  - tarjetas en blanco;
  - texto `obsidian` (#1d1d1f) y texto secundario `pewter`;
  - bordes `pale-mist`;
  - acción única `primary` (#0071e3);
  - acentos `sapphire` (#0066cc), `sky-signal` (#2997ff) e `ice-wash` (#aad0f6).
  - No añadas colores nuevos ni degradados de varios colores.
- **Tipografía:** la escala existente (`text-display`, `text-heading-lg`, `text-heading-sm`, `text-subheading`, `text-body`, `text-caption`), con `font-semibold`, `tracking-[-0.02em]` y `text-balance` en los títulos. Para los títulos de sección, usa `SectionHeading`.
- **Superficies:**
  - tarjetas `rounded-[28px] border border-pale-mist/70 bg-card` y paneles grandes `rounded-[36px]`;
  - botones `rounded-full`;
  - secciones con `py-20 md:py-28`, `container mx-auto px-4` y contenido en `max-w-6xl`.
- **Bloques de referencia:**
  - el hero oscuro `bg-obsidian text-white` de las fichas de sistemas, para Portales, IA y Sistemas;
  - la banda de CTA final con degradado azul y círculos difuminados de la portada, para el cierre de cada página;
  - el mosaico de la portada, para las cuadrículas de servicios.
- **Movimiento:** framer-motion discreto, solo para aparecer al hacer scroll (opacidad y 8 a 12 px de desplazamiento). Respeta `prefers-reduced-motion`. Nada de carruseles automáticos.
- **Modo oscuro:** cada bloque nuevo debe verse bien con el `ThemeToggle` en oscuro. Usa las mismas clases `dark:` que el código actual.
- **Tablas:** el contenido trae muchas tablas comparativas porque son lo que citan Google y las IA. Diséñalas bonitas y legibles en el celular:
  - encabezado `text-caption uppercase tracking-[0.16em] text-pewter`;
  - filas separadas por `border-pale-mist`;
  - columna de Avero resaltada con `bg-ice-wash/20`, sin exagerar;
  - en móvil, cada fila se convierte en una tarjeta apilada. No uses scroll horizontal salvo como último recurso.
- **Iconos:** `lucide-react`, como el resto del sitio.

## Componentes nuevos (reutilizables)

Crea estos componentes en `components/site/` antes de las páginas. Así todas las páginas comparten el mismo diseño:

- `breadcrumbs.tsx`: migas visibles y su `BreadcrumbList` en JSON-LD.
- `json-ld.tsx`: recibe un objeto y lo imprime en `<script type="application/ld+json">`.
- `service-hero.tsx`: variantes clara y oscura, con H1, intro, dos botones, microcopy, línea de autor («Por Alejandro Veras, fundador de Avero Technology · Actualizado el …») y la ilustración a la derecha.
- `answer-block.tsx`: H2 en forma de pregunta con su respuesta de 40 a 60 palabras destacada.
- `compare-table.tsx`: tabla comparativa responsive, como se describe arriba.
- `process-steps.tsx`: pasos numerados con línea de tiempo y la etiqueta de duración.
- `pricing-tiers.tsx`: paquetes de servicio con «Desde RD$ …» o «Cotiza sin costo».
- `case-block.tsx`: bloque de caso real con captura y métricas.
- `cta-band.tsx`: banda final con degradado azul, extraída de la portada para reutilizarla.
- `related-services.tsx`: tres tarjetas al final de cada servicio.
- `mega-menu.tsx`: el panel de Servicios del documento 00 (sección 9). Tiene 3 columnas y una tarjeta destacada en escritorio, y es un acordeón dentro del menú móvil actual. Se abre con hover y con clic, se cierra con Escape y es accesible por teclado (`aria-expanded` y foco visible).

Haz una sola definición de los servicios (nombre, URL y línea corta) en `lib/site.ts`. El mega menú, el pie, `/servicios` y los servicios relacionados la leen de ahí.

## Imágenes

Usa este orden de preferencia. La mejor prueba de que Avero sabe lo que hace es su propio trabajo.

1. **Capturas reales del trabajo de Avero:**
   - de Avero Inventario, Citas y Condominios, con cuentas de prueba y datos de demostración, nunca datos de clientes reales;
   - de este mismo sitio;
   - de la conversación del asistente de WhatsApp, tomada de `docs/whatsapp-sim/resultados.md`.

   Tómalas con el navegador automático en 2x, recórtalas y ponlas dentro de `LaptopMock` o `PhoneMock`.
2. **Ilustraciones hechas con código:** mockups de chat de WhatsApp, paneles, diagramas de flujo (mensaje → IA → catálogo → pedido) y resultados de búsqueda, construidos con JSX, SVG y lucide. Escalan sin pixelarse, pesan poco y se adaptan al modo oscuro.
3. **Fotos de internet, solo si un bloque realmente lo necesita** (por ejemplo, un ambiente de oficina para Soporte técnico):
   - Fuentes permitidas, con licencia verificada en la página de cada foto: [Wikimedia Commons](https://commons.wikimedia.org) (CC0, dominio público, CC BY o CC BY-SA), [Unsplash](https://unsplash.com/license) y [Pexels](https://www.pexels.com/license/).
   - Unsplash y Pexels suelen bloquear la descarga automática, como se documentó en `docs/demo-credits.md`. Si te pasa, no intentes saltarte el bloqueo: deja la lista de URLs elegidas para que Alejandro las descargue a mano y usa una ilustración mientras tanto.
   - Prohibido usar fotos de personas como si fueran el equipo de Avero, sus clientes o autores de testimonios; usar logos de otras empresas como si fueran clientes; y usar imágenes generadas que parezcan capturas reales.
   - Las fotos de Alejandro (Nosotros y la portada) son un hueco: deja el bloque preparado para cuando las envíe y, mientras tanto, muestra el logo.
   - Formato:
     - WebP, máximo 1600 px de ancho y menos de 200 KB, en `public/images/<página>/`;
     - `next/image` con `sizes` correctos y `priority` solo en la imagen principal de cada página;
     - el `alt` que indica la ficha SEO de cada documento.
   - Registra cada foto en `docs/image-credits.md` (archivo, URL original, autor y licencia). En las fotos CC BY o CC BY-SA, muestra el crédito junto a la imagen.

## Datos pendientes (marcadores amarillos)

Los documentos tienen marcadores como `[PRECIO]`, `RD$ [X]`, `[DATO REAL: …]` y `[CASO REAL]`. **Ninguno puede llegar a la web.**

- Centraliza esos datos en `lib/business.ts`, con valor `null` mientras no estén confirmados. Ahí van los precios de cada servicio, las formas de pago, la foto y el LinkedIn de Alejandro, los perfiles sociales, el RNC, los proyectos entregados, la garantía de los desarrollos, la fecha del asistente en producción y los demás datos marcados.
- Cuando el valor es `null`, el componente se adapta:
  - el precio muestra «Cotiza sin costo»;
  - la frase o la fila que depende del dato se oculta;
  - el bloque de caso de cliente no se renderiza;
  - el JSON-LD omite `offers` y `sameAs`.
- Así, cuando Alejandro pase un dato, basta con cambiar una línea.
- Antes de cada commit, busca los marcadores en `app/`, `components/`, `lib/` y `public/` con `rg "\[(DATO REAL|PRECIO|CASO REAL|X)\b"`. No puede haber ninguno. Haz la misma búsqueda en el HTML generado por `npm run build`.

## Orden de trabajo y puntos de control

Trabaja por fases. Al terminar cada una, para, muéstrame capturas en 390 px y 1440 px (claro y oscuro) y espera mi visto bueno.

**Fase A: base**
- La entidad: JSON-LD del layout, título por defecto y plantilla «%s | Avero Technology», y `aria-label` «Avero Technology» en el logo.
- robots.txt, sitemap con `lastModified` real (`lib/content-dates.ts`) y las redirecciones 301 de `/soporte` y `/sistemas/gestion`.
- Migas de pan, el mega menú, el menú de 6 entradas y el pie nuevo.
- Los componentes de la lista anterior.

**Fase B: páginas**
- Primero `/servicios` y los 6 servicios, en el orden del documento.
- Después la portada nueva, `/sistemas` y sus 3 fichas (con el cambio de slug a `inventario`), `/precios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto` y los cambios de `/catalogo`.
- Las páginas legales llevan el texto del documento 19 marcado como pendiente de revisión legal. Pregúntame antes de publicarlo.

**Fase C: complementos**
- Imágenes Open Graph por página (`opengraph-image.tsx`, 1200 × 630, con el estilo del sitio).
- `public/llms.txt` y `public/llms-full.txt`, regenerados sin marcadores.
- La página `/blog` con la plantilla de artículo, todavía sin artículos.
- Los enlaces al blog que aún no existen quedan ocultos.

## Control de calidad (obligatorio antes de darlo por terminado)

- `npm run lint`, `npm test` y `npm run build`, sin errores.
- `node scripts/qa/run.mjs` con las páginas nuevas añadidas a la matriz: 0 errores de consola, 0 enlaces rotos y 0 desbordes horizontales en 360, 390, 768, 1024 y 1440 px, en claro y oscuro.
- Lighthouse móvil en la portada, `/servicios` y `/servicios/chatbots-ia-whatsapp`: SEO y Accesibilidad en 100, Rendimiento de 90 o más, LCP de 2.5 s o menos y CLS de 0.1 o menos.
- Valida el JSON-LD de cada tipo de página en [validator.schema.org](https://validator.schema.org/). Las preguntas del `FAQPage` deben ser idénticas a las visibles.
- Revisa que cada página tenga un solo H1, un orden de encabezados correcto, el título y la meta del documento (con su conteo de caracteres) y un canonical propio.
- Las redirecciones deben responder 301 al destino correcto.
- Verifica que no quede ningún marcador en el código ni en el build.
- Revisa a mano en el celular el mega menú, las tablas comparativas y los CTA de WhatsApp. Cada CTA debe abrir `wa.me/18298122103` con su mensaje prellenado.

## Reglas

- Usa el texto de los documentos tal cual. Si algo no cabe en el diseño, pregúntame antes de reescribirlo. No inventes cifras, clientes, testimonios ni logos.
- Haz commits en inglés, con una idea por commit. No hagas push, merge ni despliegue en Vercel sin mi permiso.
- No toques `/dashboard`, `/admin`, la lógica del carrito ni la del asistente de WhatsApp, salvo para enlazarlos.
- Al terminar cada fase, dame un resumen corto: qué hiciste, capturas, resultados del control de calidad y qué datos de `lib/business.ts` siguen en `null`.

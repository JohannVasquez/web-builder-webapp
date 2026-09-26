# web-builder-webapp

Frontend del motor de landing pages dinámicas. Las páginas no están programadas en el
código: se ensamblan "al vuelo" a partir de los bloques visuales que dicta la
[web-builder-api](../web-builder-api) (tipo, orden y contenido de cada sección).

## Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS 4 + shadcn/ui
- React Hook Form + Zod 4 (validación estricta compartida con el backend)
- Jest + ts-jest (specs junto a cada servicio y componente lógico)
- ESLint (type-checked) + `eslint-plugin-boundaries` + Prettier
- Husky + lint-staged + commitlint (Conventional Commits)
- pnpm

## Arquitectura

Screaming Architecture por módulos de negocio, con Clean Architecture intramódulo:

```
src/
├── app/                       # Rutas (capa fina que delega en los módulos)
│   ├── layout.tsx                 # Navbar/Footer/WhatsApp con GlobalSettings
│   ├── [[...slug]]/page.tsx       # Catch-all: resuelve cualquier slug contra la API
│   └── not-found.tsx              # 404 amigable
├── modules/
│   ├── Page/                  # Motor de renderizado dinámico
│   │   ├── domain/                # PageSchema (Zod strict) + PageRepository
│   │   ├── application/           # PageService (+ .spec.ts)
│   │   ├── infrastructure/        # ApiPageRepository (fetch) + factory
│   │   └── presentation/          # COMPONENT_MAP, SectionRenderer y secciones
│   ├── GlobalSettings/        # Marca global (Navbar, Footer, botón WhatsApp)
│   ├── Navigation/            # Menú del sitio dictado por la API
│   └── Contact/               # Formulario (shadcn/ui + RHF + Zod) y ContactService
└── shared/                    # ui (shadcn), config y utilidades
```

- **Diccionario de componentes** (`COMPONENT_MAP`): traduce el `type` de cada sección
  JSONB al componente React correspondiente (AC1.3).
- **Tolerancia a fallos**: los tipos de sección desconocidos se ignoran silenciosamente
  (AC1.5) y las props inválidas hacen que el bloque no se renderice.
- **Boundaries**: `eslint-plugin-boundaries` prohíbe que `domain` importe capas
  externas y que `presentation` toque `infrastructure`.
- **Multi-página o one-page**: el menú viene de `GET /api/navigation` y las secciones
  con `anchor` se renderizan con `id`, así que un `href` del menú puede ser una página
  (`/nosotros`) o el ancla de una sección (`/#caracteristicas`). La estructura del
  sitio se decide en la base de datos, no en el código (ver README de la API).

## Identidad de marca y estilo visual

Tres capas independientes que se combinan libremente:

| Capa                   | Dónde vive                 | Qué decide                                          |
| ---------------------- | -------------------------- | --------------------------------------------------- |
| **Identidad de marca** | `settings.brand` (API)     | Colores, tipografía, logos, modo claro/oscuro       |
| **Estilo visual**      | `src/modules/VisualStyle/` | Bordes, sombras, vidrio, botones, menú, separadores |
| **Variante de bloque** | `props` de cada sección    | Cómo se ordena el contenido                         |

### Colores

`src/modules/Brand/domain/theme.ts` toma la paleta del cliente (hex) y deriva
el tema completo: tonos claros y oscuros, superficies, bordes y —lo importante—
el color de texto legible sobre cada color. `readableForeground` elige entre
blanco y negro, y eso siempre supera 4.5:1 sobre cualquier fondo; hay un test
que lo comprueba para una batería de paletas.

Distinción que importa: `--primary`, `--secondary` y `--accent` son los tokens
de superficie de shadcn (fondo de sección, hover del menú). Los colores 2 y 3
de la marca viven aparte, en `--brand-secondary` y `--brand-accent`, cada uno
con `-foreground`, `-soft`, `-strong` y `-text`. Pintar el pie de página con el
índigo del cliente se ve peor, no mejor.

Los colores de marca **no** se ajustan por contraste: son fondos de botón, y el
contraste lo aporta su propio `-foreground`. La variante `-text` es la que sí
se ajusta, para cuando el color se usa como texto sobre el fondo de la página.

### Tipografía

Las 17 fuentes del catálogo se declaran en el layout raíz, cada una aportando
solo una variable CSS. `preload: false` es deliberado: como el módulo lo
consume un layout, con `preload: true` Next precargaría las 17 en todas las
rutas. El anti-salto lo da `adjustFontFallback`, que ajusta la métrica de la
fuente de respaldo. El archivo se descarga solo si el pairing elegido lo usa.

### Estilos visuales

Para agregar uno, ver [docs/agregar-un-estilo-visual.md](docs/agregar-un-estilo-visual.md).
Son dos pasos: un archivo con los tokens y una línea en el registro. Ningún
bloque cambia.

## Caché del sitio publicado

Las lecturas del sitio (página, settings, navegación) se cachean con una
etiqueta por **dominio** de tenant: `t:<dominio>` (ver
`src/shared/lib/cacheTags.ts`). Que la clave sea el dominio y no un id es lo
que garantiza que el contenido de un cliente nunca aparezca en el sitio de
otro: el frontend nunca ve ids, solo el host de la visita.

`POST /api/revalidate` invalida esas etiquetas. Lo llama la API después de
cada escritura de administración o de un agente, por la red interna y con el
secreto compartido `REVALIDATE_SECRET`. Entrando por Caddy, `/api/*` lo
atiende la API, así que este endpoint no es alcanzable desde internet.

Usa `revalidateTag(tag, { expire: 0 })` y no el perfil `'max'`: con
stale-while-revalidate el primer visitante después de guardar seguiría viendo
la versión vieja, y lo que se busca es que el cambio se vea de inmediato.

Para invalidar a mano (por ejemplo, después de `make seed`): `make revalidate`.

## Demos de prospecto (enlace mágico)

Una **demo de prospecto** es el sitio privado de un negocio real que todavía no compró (épica
DEMO de la API). No confundir con los sitios de demostración públicos de web-builder-api#104.
La API cierra entero un tenant en estado `demo`: sin un token válido en `X-Demo-Token`
responde 404 en todas sus rutas públicas, y con él sirve lo **publicado** (no el borrador)
con `X-Demo: true`. El sitio vive en `demo-<slug>.<PLATFORM_DOMAIN>`.

Cómo viaja el token:

1. **Canje.** El prospecto abre `https://demo-<slug>.<dominio>/demo/<token>`. Lo atiende
   `src/proxy.ts` (`redeemDemoLink` del módulo `Demo`), porque es el único punto que puede
   dejar una cookie y además mostrar el 404 del sitio: valida el token contra
   `GET /api/settings` (sin caché) y exige `X-Demo: true` en la respuesta. Válido → cookie
   `demo_token` (httpOnly, `secure` en producción, `sameSite=lax`, `path=/`, **sin**
   `domain`, así queda atada al host) y redirección a `/`, que saca el token de la barra de
   direcciones. Inválido, vencido, de otra demo o descartado → el 404 normal del sitio, sin
   explicar por qué. A diferencia del enlace de revisión no se usa `draftMode`.
2. **Lecturas del servidor.** `siteCacheOptions` (`src/shared/lib/cacheTags.ts`) lee la
   cookie: con ella reenvía `X-Demo-Token` en **todas** las lecturas (páginas, ajustes, menú,
   blog, tienda, redirecciones) y usa `cache: 'no-store'` sin etiquetas. En un host `demo-*`
   tampoco cachea aunque no haya cookie, para que ni el 404 de quien no tiene enlace quede
   guardado. Si la demo vence mientras la miran, la API responde 404 y se ve el 404 común.
3. **Acciones del navegador.** Contacto (`contact`), newsletter (`newsletter`), cotización y
   compra de la tienda (`store/quote`, `store/checkout`), consentimiento (`consents`), y para
   cuando existan en el sitio, `solicitudes-datos` y `reclamos`. Hoy salen del navegador directo a `/api/*`, que en
   producción Caddy manda a la API, y el navegador no puede poner el header porque la cookie
   es httpOnly. En una demo el layout cambia la base de esas llamadas por `/demo`
   (`useSiteApiBaseUrl`), así que caen en `src/app/[tenantDomain]/demo/api/[...path]`, que
   agrega el token desde la cookie y reenvía **solo** esa lista cerrada de acciones. El token
   nunca llega a un script de la página. Consecuencia asumida: para la API esas acciones
   vienen de la IP del servidor de Next y comparten su límite de frecuencia. La compra usa el
   pago simulado de la API y vuelve a `/tienda/gracias` como un pago real.
4. **Imágenes.** `/api/media/<clave>` lo piden el navegador y el optimizador de imágenes, que
   no llevan el token: en una demo los repositorios de tienda y blog descartan la clave y se
   usa la URL firmada que la API manda al lado.

Buscadores y caché: con host `demo-*`, cookie de demo o `X-Demo: true`, el layout marca
`noindex, nofollow` en el metadata y además pinta la etiqueta `<meta name="robots">` (una
página que declara su propio `robots` pisa el del layout). `proxy.ts` agrega
`Cache-Control: private, no-store` y `X-Robots-Tag: noindex, nofollow` a toda respuesta de una
demo, tenga o no cookie. `robots.txt` responde `Disallow: /`, `sitemap.xml` un sitemap vacío
y `blog/rss.xml` un 404, siempre, sin consultar la API. No hay franja de "Propuesta para…" ni
aviso de vencimiento: el vendedor lo dice en la llamada.

Define `PLATFORM_DOMAIN` (el mismo valor que en la API) para que solo
`demo-<slug>.<PLATFORM_DOMAIN>` cuente como host de demo; sin él basta con que el primer
tramo empiece por `demo-`, y un cliente con dominio propio como `demo-motors.cl` se trataría
como demo.

### Demos en el panel

La sección **Demos** (`/demos` en el host `admin.*`) es donde el equipo de ventas trabaja las
demos desde el celular. La ven la dueña y las editoras; un usuario `client` no la ve en el
menú y, si escribe la dirección, `AdminShell` le muestra el aviso de "solo para el equipo"
(`staffOnly` en `navLinks.ts`, que también cubre `/demos/<id>`). Todo pasa por
`/api/admin/demos` con la sesión del panel.

- **Lista.** Tarjetas (no tabla, para no desplazarse de lado en el celular) con negocio,
  rubro, estado, vencimiento, visitas, última visita y quién la creó. El estado lleva ícono y
  texto, y el lector de pantalla lo anuncia como "Estado: …". Filtros: estado (incluido
  **Por vencer**, que pide `status=por-vencer` a la API), "Creadas por mí" (`createdBy`) y
  búsqueda por negocio (local, sin tildes). Una demo por vencer deja a mano el teléfono y un
  botón de WhatsApp (`https://wa.me/<solo dígitos>`).
- **Crear.** Prospecto (solo el negocio es obligatorio), dirección con vista previa
  `demo-<slug>.<PLATFORM_DOMAIN>` y punto de partida: kit por rubro, duplicar un sitio o
  vacía. `PLATFORM_DOMAIN` se lee en el servidor al pedir la página (`connection()`), solo
  para esa vista previa; sin él se muestra una dirección genérica. Si la dirección está
  ocupada, la sugerencia del 409 (`suggestedSlug`) se aplica con un clic.
- **Los enlaces se ven una vez.** Tras crear (o regenerar) se muestran los enlaces en claro
  con "Copiar", "Enviar por WhatsApp" (mensaje editable, prellenado con el enlace) y "Ver
  como equipo", y el aviso de que no se vuelven a mostrar. El panel no los guarda: cerrar el
  aviso pide confirmación.
- **Ficha** (`/demos/<id>`): prospecto editable (se manda solo lo que cambió), otras
  propuestas del mismo negocio (y "Nueva propuesta", que manda `prospectId`), visitas
  paginadas y las acciones. Cada acción aparece solo si el rol y el estado la permiten, con
  las mismas reglas que la API (`availableDemoActions`): un editor no ve Borrar, una
  convertida no se extiende. El resultado o el error de la API se muestra tal cual.
- **Editar sitio** lleva a la ficha del cliente con el tenant de la demo. Esa ficha pide la
  lista con `includeDemos=true` (clave de caché aparte: la lista de Clientes sigue sin
  demos) y, en una demo, cambia pausar, dominios y cobro por el camino de vuelta a Demos,
  porque la API rechaza esas acciones sobre una demo.
- **Convertir** explica que las otras propuestas abiertas se descartan, acepta slug y dueño
  opcionales y muestra el resultado de la invitación (`sent`, `not-needed` o `failed`). La
  lista de Clientes se vuelve a pedir, así que el sitio aparece ahí con su dirección
  definitiva.
- **Métricas** (`/demos/metricas`, solo la dueña): embudo creadas → abiertas → convertidas,
  tasas, medianas de días, resultados con los motivos de descarte y una tabla por rubro, kit,
  vendedor o mes, ordenable por conversión. Todo sale tal cual de
  `GET /api/admin/demos/metrics` (el panel no recalcula tasas) para el rango elegido: últimos
  30 o 90 días, este año o uno personalizado, en días de Chile como los cuenta la API. Un
  período sin demos muestra "Todavía no hay demos en este período." y nunca `NaN %`. Las
  barras del embudo solo repiten el número y el porcentaje que ya están en texto. Una editora
  no ve la pestaña (la API le responde 403) y, si escribe la dirección, ve el aviso de "solo
  para la dueña" (`OWNER_ONLY_SUBPATHS` en `navLinks.ts`).

## Puesta en marcha

Requiere la [web-builder-api](../web-builder-api) corriendo (por defecto en
`http://localhost:4000`).

```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

### Cambiar el puerto

Next.js decide en qué puerto arrancar **antes** de leer `.env.local` (por eso `PORT`
no se puede fijar ahí — [así lo documenta Next.js](https://nextjs.org/docs/app/api-reference/cli/next#changing-the-default-port)).
`pnpm dev`/`pnpm start` toman el puerto de la variable de entorno real del shell:

```bash
PORT=3300 pnpm dev
```

Si cambias el puerto de la API, actualiza también `API_URL`/`NEXT_PUBLIC_API_URL` en
`.env.local` (o pásalas igual que `PORT`) para que el frontend siga apuntando a la
API correcta.

## Scripts

- `pnpm test` — specs de Jest
- `pnpm lint` / `pnpm lint:fix` — ESLint type-checked + boundaries
- `pnpm format` — Prettier
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm build` && `pnpm start` — producción

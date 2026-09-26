# Arquitectura del proyecto

Para agentes de IA y desarrolladores. Léelo antes de modificar o crear módulos nuevos.

## Por qué hay dos repositorios

El proyecto se divide en dos repos con responsabilidades separadas:

| Repositorio                 | Responsabilidad                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web-builder-api`           | Motor headless. Guarda bloques como JSONB, aplica reglas de negocio, sirve la API REST y expone las herramientas MCP para agentes. No genera HTML.          |
| `web-builder-webapp` (este) | Consume la API, convierte el JSON en componentes React, aloja el catálogo de estilos visuales, sirve el panel de administración y actúa como caché público. |

Se comunican por HTTP. Agregar un tipo de bloque implica registrar el componente aquí (`COMPONENT_MAP`) y opcionalmente registrarlo en las herramientas de la API. La API lo almacena agnósticamente como datos.

## Estructura de `src/`

```
src/
├── app/                    # Rutas Next.js — capa fina que delega en módulos
│   ├── layout.tsx              # Layout raíz: fuentes, tokens CSS, Navbar/Footer/WhatsApp
│   ├── globals.css             # Variables CSS de tokens (.ui-card, .ui-button, etc.)
│   ├── not-found.tsx           # 404 amigable
│   ├── styleguide/             # Página interna de muestra de estilos (/_styleguide)
│   ├── [tenantDomain]/         # Sitio público de cada cliente
│   │   ├── [[...slug]]/        # Catch-all: resuelve cualquier slug contra la API
│   │   ├── blog/               # Rutas del blog del cliente
│   │   ├── tienda/             # Rutas de la tienda del cliente
│   │   ├── demo/               # 404 del enlace de demo inválido y reenvío de acciones (/demo/api)
│   │   └── ...
│   ├── admin/                  # Panel de administración
│   │   ├── layout.tsx          # Shell del panel
│   │   ├── clientes/[tenantId]/ # Pantallas por cliente
│   │   ├── demos/              # Demos de prospecto: lista, creación y ficha (/demos/[demoId])
│   │   └── ...
│   └── api/                    # Route handlers de Next.js
│       ├── revalidate/         # POST /api/revalidate — invalida caché por dominio
│       └── catalog/            # GET /api/catalog — catálogo de bloques para agentes
└── modules/                # Módulos de negocio (Screaming Architecture)
│   ├── Page/               # Motor de renderizado dinámico
│   ├── Admin/              # Lógica del panel y cliente de la API admin
│   ├── Brand/              # Paleta y tema CSS derivados de la identidad del cliente
│   ├── VisualStyle/        # Catálogo de estilos visuales (tokens y registro)
│   ├── GlobalSettings/     # Marca global: Navbar, Footer, botón WhatsApp
│   ├── Navigation/         # Menú del sitio dictado por la API
│   ├── Contact/            # Formulario de contacto
│   ├── Blog/               # Módulo de blog
│   ├── Store/              # Módulo de tienda
│   ├── FileStorage/        # Imágenes del cliente
│   ├── Consent/            # Banner de consentimiento (Ley 21.719)
│   ├── Demo/               # Demo de prospecto: canje del enlace mágico y reenvío de acciones
│   └── Redirect/           # Redirecciones por cliente
└── shared/                 # Código compartido entre módulos
    ├── config/             # Configuración de API y tenant
    ├── lib/                # Utilidades puras (color, seo, cacheTags, etc.)
    └── ui/                 # Componentes shadcn/ui
```

## Qué va en `src/app/` y qué en `src/modules/`

**`src/app/`** contiene solo lo que Next.js exige en ese lugar: archivos `page.tsx`, `layout.tsx`, `route.ts` y similares. Son la frontera HTTP. Cada archivo delega inmediatamente en un módulo; no contiene lógica propia.

**`src/modules/`** contiene toda la lógica real, organizada por dominio de negocio. Si algo no es una ruta de Next.js, va en un módulo.

## Capas dentro de un módulo

Cada módulo aplica Clean Architecture en cuatro capas. Las reglas de dependencia las verifica `eslint-plugin-boundaries` en cada `pnpm lint`.

```
domain         ← núcleo puro, sin dependencias externas al módulo
application    ← casos de uso y lógica de presentación (funciones puras)
infrastructure ← implementaciones concretas (fetch a la API, etc.)
presentation   ← componentes React que el usuario ve
```

### Reglas de dependencia (extraídas de `eslint.config.mjs`)

| Capa             | Puede importar de                                   |
| ---------------- | --------------------------------------------------- |
| `domain`         | `domain`, `shared`                                  |
| `application`    | `domain`, `application`, `shared`                   |
| `infrastructure` | `domain`, `application`, `infrastructure`, `shared` |
| `presentation`   | `domain`, `application`, `presentation`, `shared`   |
| `shared`         | `shared`                                            |

**`presentation` nunca importa de `infrastructure`.** El sentido: los componentes React nunca llaman directamente a `fetch`; lo hace la capa de `infrastructure`, y `presentation` consume lo que le pasa `application`.

### Ejemplo real — módulo `Page`

```
src/modules/Page/
├── domain/
│   ├── Page.ts             # Tipo PageData y PageSection (Zod strict)
│   └── PageRepository.ts   # Contrato abstracto para obtener páginas
├── application/
│   └── PageService.ts      # Orquesta la obtención de una página
├── infrastructure/
│   └── ApiPageRepository.ts # Implementa PageRepository con fetch a la API
└── presentation/
    ├── componentMap.ts      # COMPONENT_MAP: mapea type → componente React
    ├── SectionRenderer.tsx  # Renderiza una sección individual
    └── sections/            # Uno por tipo de bloque (Hero.tsx, Features.tsx, …)
```

## Dónde vive cada cosa que un agente va a tocar

### Un bloque de página nuevo

1. Componente React en `src/modules/Page/presentation/sections/<NombreBloque>.tsx`.
2. Una línea en `src/modules/Page/presentation/componentMap.ts` (en `COMPONENT_MAP`).
3. Una entrada en `src/modules/Admin/domain/blockCatalog.ts` (en `BLOCK_CATALOG`).
4. Una entrada de miniaturas en `src/modules/Admin/domain/blockHints.ts` (en `BLOCK_THUMBNAILS`).

El test `src/modules/docs-sync.spec.ts` fallará si `COMPONENT_MAP` y `BLOCK_CATALOG` no son consistentes.

### Un estilo visual nuevo

Ver [docs/agregar-un-estilo-visual.md](agregar-un-estilo-visual.md). En resumen:

1. Archivo en `src/modules/VisualStyle/domain/styles/<nombreEstilo>.ts`.
2. Una línea en `src/modules/VisualStyle/domain/registry.ts` (en `VISUAL_STYLES`).

El test `src/modules/docs-sync.spec.ts` fallará si `VISUAL_STYLES` no coincide con lo que documenta la guía.

### Una pantalla del panel

- Ruta en `src/app/admin/clientes/[tenantId]/<seccion>/page.tsx`, o en `src/app/admin/<seccion>/page.tsx` si no cuelga de un cliente (como `demos/`).
- Si es una sección del menú, una entrada en `src/modules/Admin/application/navLinks.ts` con quién la ve (`ownerOnly`, `staffOnly`); `AdminShell` muestra el aviso a quien escriba la dirección sin permiso.
- Componente de presentación en `src/modules/Admin/presentation/<NombreVista>.tsx`.
- Lógica en `src/modules/Admin/application/<nombre>.ts`.
- Llamadas a la API en `src/modules/Admin/application/AdminApiClient.ts`.

### Un estilo visual en un bloque concreto

No se hace en el bloque. Se define un token en `src/modules/VisualStyle/domain/VisualStyle.ts`, se le da valor en cada archivo de estilo, y se usa a través de una clase `.ui-*` definida en `src/app/globals.css`. Ver DESIGN.md para la lista de clases disponibles.

### Una ruta pública del sitio

- Ruta en `src/app/[tenantDomain]/<ruta>/page.tsx`.
- La ruta lee el dominio del tenant desde los parámetros de ruta y lo pasa a los servicios de los módulos correspondientes.
- El caché se invalida por dominio con `revalidateTag` desde `src/shared/lib/cacheTags.ts`.
- Toda lectura a la API pasa por `siteCacheOptions`: es la que reenvía el token de una demo de prospecto y la saca de la caché. Una lectura nueva que arme su propio `fetch` sin ella rompe el aislamiento de las demos (ver "Demos de prospecto" en el README).

## Tres capas de identidad visual

Son independientes y se combinan libremente. Cambiar una no afecta las otras.

| Capa               | Dónde vive                         | Qué decide                                          |
| ------------------ | ---------------------------------- | --------------------------------------------------- |
| Identidad de marca | `settings.brand` (viene de la API) | Colores, tipografía, logos, modo claro/oscuro       |
| Estilo visual      | `src/modules/VisualStyle/`         | Bordes, sombras, radios, botones, menú, separadores |
| Variante de bloque | `props` de cada sección            | Disposición del contenido dentro del bloque         |

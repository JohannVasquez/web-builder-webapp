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

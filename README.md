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
│   └── Contact/               # Formulario (shadcn/ui + RHF + Zod) y ContactService
└── shared/                    # ui (shadcn), config y utilidades
```

- **Diccionario de componentes** (`COMPONENT_MAP`): traduce el `type` de cada sección
  JSONB al componente React correspondiente (AC1.3).
- **Tolerancia a fallos**: los tipos de sección desconocidos se ignoran silenciosamente
  (AC1.5) y las props inválidas hacen que el bloque no se renderice.
- **Boundaries**: `eslint-plugin-boundaries` prohíbe que `domain` importe capas
  externas y que `presentation` toque `infrastructure`.

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

# Cómo agregar algo nuevo

Para agentes de IA y desarrolladores. Léelo cuando vayas a agregar un bloque de página o un estilo visual. Cada paso a paso está verificado contra el código real.

## 1. Agregar un bloque de página nuevo

Un bloque de página es una sección que puede aparecer en cualquier página de cualquier cliente. Actualmente hay 24 tipos en `COMPONENT_MAP` (Hero, Features, CallToAction, TextBlock, ContactForm, Stats, ServiceCards, SplitHighlights, Testimonials, LocationMap, Columns, Faq, Pricing, Gallery, LogoCloud, Team, Timeline, Video, AnnouncementBar, BeforeAfter, OpeningHours, Newsletter, GoogleReviews, LatestPosts, FeaturedProducts).

### Paso 1: crea el componente React

`src/modules/Page/presentation/sections/<NombreBloque>.tsx`

El componente recibe `SectionComponentProps` (importado de `@/modules/Page/presentation/SectionComponentProps`). Reglas que debe cumplir:

- Tiene que verse bien sin ninguna imagen cargada (ver PRODUCT.md — los kits nacen sin imágenes).
- No escribe colores, sombras ni radios a mano: usa clases `.ui-card`, `.ui-button`, `.ui-surface`, etc. (ver DESIGN.md para la lista completa).
- No usa `py-20` u otros valores de espaciado absolutos: el espaciado entre secciones lo controla `--brand-section-spacing`.
- Si los datos son inválidos, el bloque no se renderiza (devuelve `null`), no rompe la página.

### Paso 2: regístralo en el diccionario de componentes

`src/modules/Page/presentation/componentMap.ts` — agrega una línea a `COMPONENT_MAP`:

```typescript
// en COMPONENT_MAP:
MiBloque: MiBloqueComponent,
```

La clave es el `type` que devuelve la API. Debe coincidir exactamente.

### Paso 3: agrégalo al catálogo del panel

`src/modules/Admin/domain/blockCatalog.ts` — agrega una entrada a `BLOCK_CATALOG`:

```typescript
{
  type: 'MiBloque',
  label: 'Nombre visible en el panel',
  description: 'Frase corta de para qué sirve.',
  family: 'contenido', // 'inicio' | 'contenido' | 'confianza' | 'catalogo' | 'contacto' | 'tienda'
},
```

### Paso 4: agrégalo a las miniaturas del panel

`src/modules/Admin/domain/blockHints.ts` — agrega una entrada a `BLOCK_THUMBNAILS`:

```typescript
MiBloque: [
  { x: 10, y: 10, width: 80, height: 10, tone: 'solid' },
  { x: 10, y: 25, width: 80, height: 30, tone: 'muted' },
],
```

Cada rect es un porcentaje del área de 100×60. Los tonos disponibles son `'solid'`, `'muted'` y `'accent'`.

### Paso 5: verifica

```bash
pnpm typecheck
pnpm lint
pnpm test   # docs-sync.spec.ts fallará si falta cualquiera de los pasos anteriores
```

### Documentación a actualizar

- **README.md** si el nuevo bloque cambia la arquitectura o el catálogo de capacidades del producto.
- **PRODUCT.md** (sección «Capabilities and Constraints») si el nuevo bloque es una capacidad nueva relevante del producto.

---

## 2. Agregar un estilo visual nuevo

Un estilo visual cambia la personalidad completa del sitio sin tocar ningún bloque. Para el paso a paso detallado, el contrato de tokens y las reglas que debe cumplir, lee [docs/agregar-un-estilo-visual.md](agregar-un-estilo-visual.md): esa guía es la autoridad y no se duplica aquí.

Resumen en dos pasos:

1. Crea `src/modules/VisualStyle/domain/styles/<tuEstilo>.ts` con los 30 tokens de `StyleTokens`.
2. Agrégalo al array `VISUAL_STYLES` en `src/modules/VisualStyle/domain/registry.ts`.

### Verificar

```bash
pnpm typecheck   # StyleTokens es un tipo cerrado: olvidar un token es error de compilación
pnpm lint
pnpm test        # docs-sync.spec.ts verifica que el registro y la documentación sean consistentes
```

### Documentación a actualizar

- **README.md** (sección «Estilos visuales») si el recuento cambia.

# Convenciones de desarrollo

Para agentes de IA y desarrolladores. Léelo antes de crear o modificar cualquier archivo. Estas reglas existen para que el código que produce un agente sea indistinguible del que escribe un humano experto.

## 1. Nombres de archivos y carpetas

| Tipo | Convención | Ejemplo |
| --- | --- | --- |
| Carpeta de módulo | `PascalCase` | `VisualStyle/`, `GlobalSettings/` |
| Componente React | `PascalCase` | `SectionRenderer.tsx`, `BrandEditor.tsx` |
| Función, utilidad o config | `camelCase` | `cacheTags.ts`, `sectionLayout.ts` |
| Archivo de test | igual que el fuente + `.spec` | `PageService.spec.ts`, `color.spec.ts` |
| Estilo visual | `camelCase` | `neoBrutalism.ts`, `liquidGlass.ts` |

**Por qué:** permite saber a primera vista si un archivo define algo que se instancia/importa como objeto (`PascalCase`) o si es código procedimental o de configuración (`camelCase`).

## 2. Comentarios en el código

**La convención oficial es `//` de una línea.** Los comentarios deben explicar el **por qué**, no el qué.

```typescript
// next dev regenera este bloque automáticamente; el contenido propio va después del separador
// preload: false es deliberado — con true Next precargaría las 17 fuentes en cada ruta
// revalidateTag con expire:0 y no 'max': con stale-while-revalidate el primer visitante vería la versión vieja
```

No hagas esto:

```typescript
// Obtiene la página por slug   ← el código ya lo dice; el comentario no aporta nada
/** @param slug - el slug de la página */  ← TypeScript ya tiene los tipos
```

**Recuento actual (medido con `grep -rl`):** 249 archivos usan `//`, 44 usan `/** */`. El código existente con `/** */` se deja como está; el código nuevo siempre usa `//`.

**Por qué:** TypeScript ya describe los tipos; un comentario de bloque sobre una función tipada es ruido. El valor real de un comentario es el contexto de negocio que no se puede deducir del código.

## 3. Imports y alias de rutas

Usa siempre el alias `@/` configurado en `tsconfig.json` en lugar de rutas relativas largas.

```typescript
// ✓ correcto
import { VISUAL_STYLES } from '@/modules/VisualStyle/domain/registry';
import { cacheTags } from '@/shared/lib/cacheTags';

// ✗ incorrecto
import { VISUAL_STYLES } from '../../../modules/VisualStyle/domain/registry';
```

**Por qué:** las rutas relativas largas se rompen si mueves el archivo. El alias también es lo que usa `eslint-plugin-boundaries` para validar las reglas de dependencia entre capas; un import relativo que cruza capas puede esquivar la validación.

## 4. Tests

- **Ubicación:** junto al archivo que prueban, con extensión `.spec.ts` o `.spec.tsx`.
  - `src/shared/lib/color.ts` → `src/shared/lib/color.spec.ts`
  - `src/modules/Admin/application/brandForm.ts` → `src/modules/Admin/application/brandForm.spec.ts`
- **Framework:** Jest + ts-jest. Configuración en `jest.config.mjs`.
- **Cobertura:** las funciones de `domain` y `application` son las más importantes de cubrir; los componentes de `presentation` raramente se testean de forma aislada.
- **Tests de sincronización de documentación:** `src/modules/docs-sync.spec.ts` verifica que `COMPONENT_MAP`, `BLOCK_CATALOG` y `VISUAL_STYLES` sean consistentes con la documentación. Falla si agregas algo al código sin documentarlo.

**Por qué:** mantener el test junto al fuente hace imposible ignorarlo al modificar el archivo; ambos se mueven juntos.

## 5. Validación con Zod

Todos los datos que cruzan la frontera desde la API se validan con Zod antes de pasarlos a `application` o `domain`. Los esquemas viven en `domain/`.

```typescript
// src/modules/Page/domain/Page.ts define PageSchema con z.object({...}).strict()
// La infraestructura valida antes de exponer los datos a la aplicación
```

**Por qué:** garantiza que el dominio nunca reciba datos con forma incorrecta. Los errores de validación son visibles y descriptivos, no errores silenciosos en producción.

## 6. Mensajes de commit

Sigue [Conventional Commits](https://www.conventionalcommits.org/). Husky + commitlint lo validan automáticamente antes de cada commit.

```
feat(page): add FeaturedProducts block
fix(brand): ensure readableForeground passes 4.5:1 for all palettes
docs: add architecture guide for agents
refactor(admin): extract brandForm logic to application layer
```

El tipo puede ser: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`.

**Por qué:** facilita entender el impacto de cada commit y automatizar changelogs.

## 7. Lint y typecheck

Antes de terminar cualquier tarea, verifica:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint type-checked + boundaries
pnpm test        # Jest
```

No declares que todo está en verde sin haber corrido los tres. El lint incluye reglas de boundaries que TypeScript no detecta.

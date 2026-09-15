# Cómo agregar un estilo visual

Un estilo visual cambia la personalidad completa del sitio —bordes, sombras,
fondos de tarjeta, botones, campos, menú, separadores y animaciones— sin tocar
el contenido ni la identidad de marca. **Agregar uno no requiere modificar
ningún bloque.**

## Los tres pasos

### 1. Crea el archivo del estilo

`src/modules/VisualStyle/domain/styles/<tuEstilo>.ts`:

```ts
import type { VisualStyleDefinition } from '../VisualStyle';

export const bento: VisualStyleDefinition = {
  id: 'bento',
  label: 'Bento',
  description: 'Tarjetas de distintos tamaños, esquinas muy redondeadas.',
  tokens: {
    // Los 30 tokens de StyleTokens. El compilador te obliga a declararlos todos.
  },
  darkTokens: {
    // Opcional: solo los que cambian en modo oscuro.
  },
  css: `...`, // Opcional: reglas que no caben en un token.
};
```

El `id` va en minúsculas y con guiones: es lo que se guarda en
`tenant_brands.visual_style` y lo que valida la API.

### 2. Regístralo

En `src/modules/VisualStyle/domain/registry.ts`, impórtalo y agrégalo al array
`VISUAL_STYLES`. Es una línea.

### 3. Listo

El estilo aparece automáticamente en:

- el sitio público de cualquier cliente que lo elija,
- el selector de estilo del panel,
- el catálogo que expone el MCP a los agentes de IA,
- la página interna de muestra (`/_styleguide`).

No hay un cuarto paso. Si te encuentras editando un bloque para que tu estilo
se vea bien, falta un token: agrégalo a `StyleTokens`, dale valor en los
estilos existentes y usa ese token desde la clase `.ui-*` correspondiente en
`src/app/globals.css`.

## El contrato de tokens

Los bloques nunca saben qué estilo está activo. Solo usan estas clases,
definidas una vez en `globals.css`:

| Clase               | Para qué                                                    |
| ------------------- | ----------------------------------------------------------- |
| `.ui-card`          | Cualquier tarjeta: fondo, borde, radio, sombra y desenfoque |
| `.ui-surface`       | Fondo alternativo de una sección                            |
| `.ui-divider`       | Separador entre bloques o items                             |
| `.ui-button`        | Radio, borde, sombra, peso y el "hundido" al presionar      |
| `.ui-input`         | Campos de formulario                                        |
| `.ui-nav`           | Barra de navegación                                         |
| `.ui-heading`       | Peso y tracking de los títulos                              |
| `.ui-page-backdrop` | Capa decorativa de fondo (manchas, aurora)                  |

Los tokens concretos están tipados en
`src/modules/VisualStyle/domain/VisualStyle.ts`. Como `StyleTokens` es un tipo
cerrado, olvidar uno es un error de compilación, no un bug visual que aparece
en producción.

## Sobrescribir el estilo en un bloque

El estilo del sitio se aplica en `:root`, pero además se emiten las reglas de
todos los estilos scopeadas por `[data-visual-style='<id>']`. Poniendo ese
atributo en un bloque, ese subárbol usa otro estilo y gana por especificidad.
Es una excepción explícita, no el camino normal.

## Reglas que un estilo debe cumplir

- **Legibilidad.** El texto tiene que seguir cumpliendo contraste AA sobre las
  superficies del estilo, en claro y en oscuro.
- **Degradación.** Si el estilo depende de una capacidad del navegador
  (`backdrop-filter`, por ejemplo), tiene que traer una alternativa sólida en
  un bloque `@supports not`. Glassmorphism es el ejemplo a copiar.
- **Movimiento.** No hace falta que cada estilo apague sus animaciones: el
  `@media (prefers-reduced-motion: reduce)` global de `globals.css` ya lo hace
  para todo el sitio.
- **Celular.** Revísalo a 375 px de ancho antes de darlo por terminado.

---
name: Web Builder
description: Chasis visual parametrico donde la marca la pone cada cliente y el estilo es uno de trece intercambiables.
colors:
  background: 'oklch(1 0 0)'
  foreground: 'oklch(0.145 0 0)'
  card: 'oklch(1 0 0)'
  muted: 'oklch(0.97 0 0)'
  muted-foreground: 'oklch(0.556 0 0)'
  border: 'oklch(0.922 0 0)'
  input: 'oklch(0.922 0 0)'
  ring: 'oklch(0.708 0 0)'
  destructive: 'oklch(0.577 0.245 27.325)'
  brand-primary: '#171717'
  brand-secondary: '#f5f5f5'
  brand-accent: '#e5e5e5'
  brand-success: '#16a34a'
  brand-warning: '#d97706'
  brand-danger: '#dc2626'
  dark-background: '#0b0b0d'
  dark-foreground: '#fafafa'
typography:
  display:
    fontFamily: 'var(--font-heading, Inter), ui-sans-serif, system-ui, sans-serif'
    fontWeight: 700
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'var(--font-body, Inter), ui-sans-serif, system-ui, sans-serif'
    fontWeight: 400
  label:
    fontFamily: 'var(--font-body, Inter), ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  surface: '14px'
  control: '10px'
  field: '8px'
spacing:
  section-compact: '4rem'
  section-normal: '5rem'
  section-spacious: '8rem'
components:
  button-primary:
    backgroundColor: '{colors.brand-primary}'
    textColor: '{colors.dark-foreground}'
    rounded: '{rounded.control}'
    padding: '0.5rem 1rem'
    height: '2.25rem'
    typography: '{typography.label}'
  button-secondary:
    backgroundColor: '{colors.brand-secondary}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: '0.5rem 1rem'
    height: '2.25rem'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: '0.5rem 1rem'
    height: '2.25rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: '0.5rem 1rem'
    height: '2.25rem'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.surface}'
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.field}'
    height: '2.25rem'
  nav:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
---

# Design System: Web Builder

## Overview

**Creative North Star: "El Chasís"**

Este sistema no tiene cara propia, y esa es su tesis. Lo que está documentado aquí es la estructura que nunca se ve: la geometría, el ritmo vertical, el contraste garantizado y el vocabulario de superficies. La carrocería —el color, la tipografía, la textura— la monta cada cliente encima, sin tocar una sola línea de lo que hay debajo. Un bloque jamás sabe de qué color es la marca que lo está usando ni qué estilo visual está activo. Esa ignorancia es deliberada: es lo que permite que el mismo contenido se vea Neo-Brutalista para una barbería y Editorial para un estudio jurídico sin reescribir nada.

El sistema se compone de tres capas independientes que se combinan libremente. La **identidad de marca** aporta color y tipografía, y llega desde los datos de cada cliente. El **estilo visual** aporta forma, profundidad y material, y es uno de trece definiciones intercambiables que solo declaran valores para un contrato fijo de tokens. La **variante de bloque** aporta disposición. Ninguna capa puede romper a las otras, y cuando una falta, la de abajo responde con un valor razonable en vez de fallar.

Lo que sale de fábrica —el estilo Clásico sobre la paleta neutra— es **confiable antes que memorable**. Nada llama la atención sobre sí mismo: bordes apenas redondeados, una sombra de un píxel, transiciones de 160 milisegundos. El visitante tiene que recordar al electricista, no al sitio. La sobriedad del estado por defecto es una decisión, no una carencia: es el piso sobre el que un cliente con identidad propia construye, y el lugar seguro al que cae cualquier configuración incompleta.

**Key Characteristics:**

- Ningún bloque escribe un color, una sombra ni un radio: todos se toman de tokens.
- El color de texto sobre cualquier fondo se calcula, nunca se elige.
- La profundidad y el material son decisión del estilo, no del sistema.
- La densidad completa —tipografía y respiro entre secciones— es un solo multiplicador.
- Todo tiene que verse bien sin imágenes y sin JavaScript.

## Colors

La paleta no es fija: es un punto de partida neutro que cada cliente reemplaza. Lo que sí es fijo es la estructura de roles y, sobre todo, la garantía de contraste.

Los tokens viven en dos lugares y cada uno es normativo en el suyo: las superficies de interfaz se declaran en `globals.css` en OKLCH, y la paleta de marca se declara en `theme.ts` en hexadecimal, porque es la que llega desde los datos del cliente y se inyecta en tiempo de ejecución.

### Primary

- **Tinta Casi Negra** (`#171717`): el color de marca por defecto. Fondo de botón principal, énfasis y elementos de acción. Un cliente lo reemplaza con el suyo y todo el sitio se actualiza de una vez.

### Secondary

- **Papel Apenas Gris** (`#f5f5f5`): segundo color de marca. Fondos de sección alternados y superficies de descanso que separan bloques sin dibujar una línea.

### Tertiary

- **Gris de Contorno** (`#e5e5e5`): color de acento por defecto. Detalles, realces y estados suaves.

### Neutral

- **Blanco Puro** (`oklch(1 0 0)`): fondo de página y de tarjeta en modo claro.
- **Casi Negro** (`oklch(0.145 0 0)`): texto principal en modo claro.
- **Gris Silencioso** (`oklch(0.556 0 0)`): texto secundario, leyendas y apoyos.
- **Gris de Borde** (`oklch(0.922 0 0)`): bordes, separadores y contorno de campos.
- **Noche Azulada** (`#0b0b0d`) y **Niebla** (`#fafafa`): fondo y texto en modo oscuro. El fondo oscuro no es negro puro: un tinte azul mínimo evita el aspecto de terminal.

### Estados

- **Verde Confirmación** (`#16a34a`), **Ámbar Advertencia** (`#d97706`), **Rojo Error** (`#dc2626`): estados del sistema. Son de marca, no de interfaz, y cada uno lleva su propio color de texto calculado.

### Named Rules

**La Regla del Chasís.** Ningún bloque escribe un color. Todos se toman de tokens de marca. Un color literal dentro de un bloque es una excepción que hay que justificar explícitamente, porque rompe la promesa de que cambiar la marca actualiza el sitio entero.

**La Regla del Contraste Derivado.** El color del texto sobre cualquier color lo decide el sistema eligiendo entre blanco y negro, nunca una persona. Esa elección supera 4.5:1 sobre cualquier fondo y hay pruebas que lo verifican contra una batería de paletas. No se escribe un color de texto a mano sobre un fondo de marca.

**La Regla de los Dos Registros.** `--primary`, `--secondary` y `--accent` son superficies de interfaz —fondo de sección, hover del menú—. Los colores dos y tres de la marca viven aparte, en `--brand-secondary` y `--brand-accent`. Pintar el pie de página con el índigo del cliente se ve peor, no mejor.

**La Regla del Color Intacto.** Los colores de marca no se ajustan por contraste: son fondos de botón y el contraste lo aporta su propio `-foreground`. Solo la variante `-text` se ajusta, para cuando el color se usa como texto sobre el fondo de la página.

## Typography

**Display Font:** la que elija el cliente (`var(--font-heading)`), con Inter de respaldo
**Body Font:** la que elija el cliente (`var(--font-body)`), con la pila del sistema de respaldo

**Character:** hay diecisiete familias disponibles, combinadas en pares curados que funcionan juntos. El par por defecto es Inter para ambos roles: neutral a propósito, porque es el que recibe un cliente que todavía no eligió nada y no debe parecer inacabado.

### Hierarchy

- **Display** (700, tracking -0.025em): todos los títulos, de `h1` a `h6`. El peso y el tracking no son fijos del sistema sino del estilo visual activo: Editorial los afloja, Neo-Brutalism los endurece.
- **Body** (400): texto corrido, con la familia de cuerpo.
- **Label** (500, 0.875rem): botones, etiquetas de formulario y elementos de control.

### Named Rules

**La Regla de las Dos Variables.** Solo existen dos familias en todo el sitio: títulos y texto. No hay una tercera para detalles ni una cuarta para citas. Un par curado se elige entero.

**La Regla del Tamaño Único.** La densidad tipográfica es un multiplicador sobre la raíz (`0.9375`, `1` o `1.0625`), no una tabla de tamaños. Cambiar a compacto o amplio reescala el sitio completo sin tocar un solo bloque.

**La Regla del Cero Salto.** Las diecisiete familias se declaran juntas pero ninguna se precarga: el archivo se descarga solo si el par elegido lo usa, y el salto al cargar lo evita el ajuste métrico de la fuente de respaldo, no un parpadeo oculto.

## Layout

El ancho del contenido es una decisión por bloque, entre seis pasos: `tight` (42rem), `narrow` (48rem), `medium` (56rem), `normal` (64rem), `wide` (72rem) y `full` (sin límite). El valor por defecto lo trae cada bloque de fábrica, para que el editor pueda sobrescribirlo sin que "no me lo pidieron" y "me pidieron normal" se confundan.

El ritmo vertical tiene tres pasos, y cada uno crece del celular al escritorio: compacto (3rem → 4rem), normal (4rem → 5rem) y amplio (6rem → 8rem). Todos se multiplican por el respiro de la identidad de marca, así que la densidad elegida por el cliente afecta el aire entre secciones y no solo el tamaño del texto.

La alineación del texto es también por bloque: izquierda, centro o derecha. Y cualquier bloque puede ocultarse en celular o en escritorio sin dejar de existir.

### Named Rules

**La Regla del Respiro Escalable.** El espaciado entre secciones nunca es un valor absoluto: siempre es el paso multiplicado por `--brand-section-spacing`. Un `py-20` escrito a mano dentro de un bloque queda fuera del sistema y rompe la densidad elegida.

**La Regla del Celular Primero de Verdad.** Toda variante tiene que verse bien en celular, porque es donde llega la mayoría de las visitas. Una disposición que solo funciona en escritorio no está terminada.

## Elevation & Depth

**La profundidad no es una decisión de este sistema: es una decisión del estilo activo.** El sistema solo define _dónde_ puede haber sombra —tarjeta, botón, campo, menú— y deja que cada estilo declare cuánta. Por eso no existe una escala de elevación global: existe un contrato de cuatro ranuras que trece estilos rellenan de forma distinta.

En el estilo Clásico, que es el de fábrica, la profundidad es casi inexistente y funciona por contorno: un borde de un píxel hace el trabajo y la sombra apenas insinúa que algo está encima.

### Shadow Vocabulary (estilo Clásico)

- **Tarjeta en reposo** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): suficiente para separar del fondo, insuficiente para llamar la atención.
- **Botón** (`0 1px 2px 0 rgb(0 0 0 / 0.08)`): apenas más marcada que la tarjeta, para que se lea como pulsable.
- **Campo** (`none`): los campos se definen por borde, no por sombra.
- **Menú** (`none`, con desenfoque de fondo de 8px): la barra superior flota por transparencia, no por sombra.

### Named Rules

**La Regla del Token Prestado.** Ninguna sombra se escribe dentro de un bloque. Toda sombra sale de `--ui-card-shadow`, `--ui-button-shadow`, `--ui-input-shadow` o `--ui-nav-shadow`. Un `box-shadow` literal en un bloque hace que ese bloque se vea igual en los trece estilos, que es exactamente el defecto que el sistema existe para evitar.

**La Regla del Hundimiento Opcional.** El botón que se hunde al presionarlo es un token, no un comportamiento: `--ui-button-active-translate` vale cero en casi todos los estilos y solo el Neo-Brutalism lo activa. El movimiento al presionar se hereda; no se programa.

## Shapes

El radio tiene una raíz única (`10px`) de la que todo deriva: pequeño (6px), medio (8px), grande (10px) y extra (14px). Sobre esa base, el estilo activo redefine tres radios de uso: superficie (14px en Clásico), control (10px) y campo (8px). La jerarquía es constante aunque los valores cambien: una tarjeta siempre está más redondeada que un campo.

El borde es el otro elemento de forma, y en el estilo de fábrica hace más trabajo que la sombra: un píxel de gris claro define tarjetas, campos, separadores y el borde inferior del menú.

### Named Rules

**La Regla del Radio Heredado.** Un bloque nunca declara su propio radio. Usa las clases de superficie del sistema (`.ui-card`, `.ui-button`, `.ui-input`) y recibe la forma del estilo activo. Un `rounded-xl` escrito a mano sobrevive al cambio de estilo, que es justamente lo que no debe pasar.

## Components

El sistema expone siete clases de superficie que traducen el estilo activo a CSS. Un bloque las usa y nunca pregunta qué estilo está puesto: `.ui-card`, `.ui-surface`, `.ui-button`, `.ui-input`, `.ui-nav`, `.ui-divider` y `.ui-heading`.

### Buttons

- **Shape:** control redondeado (`10px` en Clásico), heredado del estilo activo.
- **Primary:** fondo del color de marca con su texto calculado; alto 36px, padding `0.5rem 1rem`, peso 500, tamaño 0.875rem.
- **Hover:** el fondo baja a 90% de opacidad. Transición de 160ms.
- **Focus:** anillo de 3px con el color de anillo, más cambio de borde. Nunca se elimina el foco visible.
- **Active:** desplazamiento y sombra heredados del estilo; cero en Clásico.
- **Secondary / Outline / Ghost / Link:** superficie suave, contorno con fondo de página, transparente con hover de acento, y texto subrayado al pasar, respectivamente.
- **Disabled:** opacidad 50% y sin eventos de puntero.

### Cards / Containers

- **Corner Style:** radio de superficie (`14px` en Clásico).
- **Background:** color de tarjeta, o lo que declare el estilo, incluido vidrio esmerilado.
- **Shadow Strategy:** ver Elevation & Depth; una sola variable.
- **Border:** un píxel del color de borde por defecto, en ancho y color del estilo.
- **Transición:** solo la sombra, 160ms.

### Inputs / Fields

- **Style:** fondo de página, borde de un píxel, radio de campo (`8px`).
- **Focus:** mismo anillo de 3px que el botón.
- **Error:** borde y anillo en el color destructivo, activados por `aria-invalid`, no por una clase.

### Navigation

- **Style:** fondo de página al 80% con desenfoque de 8px, borde inferior de un píxel.
- **Mobile:** la barra es un bloque con variantes propias; todas deben funcionar en celular.

### Bloques de contenido

Veintiocho tipos, cada uno con variantes de disposición. Tres reglas los gobiernan a todos: un tipo desconocido se ignora en silencio en vez de romper la página, unos datos inválidos hacen que el bloque no se renderice, y **todos deben verse bien sin imágenes**, porque los kits por rubro nacen sin ellas.

### Named Rules

**La Regla de la Clase de Superficie.** Si un elemento necesita fondo, borde, radio o sombra, usa una clase `.ui-*`. Si ninguna calza, el sistema necesita un token nuevo, no una excepción local.

## Do's and Don'ts

### Do:

- **Do** tomar todo color, sombra, radio y transición de un token. Si no existe el token, agregarlo al contrato de estilo, no escribir el valor.
- **Do** dejar que el sistema calcule el color de texto sobre cualquier fondo de marca.
- **Do** diseñar cada bloque para que se vea completo sin ninguna imagen cargada.
- **Do** escalar el espaciado vertical con `--brand-section-spacing` en vez de fijar valores.
- **Do** respetar "reducir movimiento": ya está resuelto globalmente y ninguna animación nueva debe esquivarlo.
- **Do** mantener el contenido legible sin JavaScript: las animaciones de entrada solo ocultan bajo `[data-js='on']`, para que sin JS nada desaparezca.
- **Do** verificar toda variante nueva en celular antes de darla por terminada.

### Don't:

- **Don't** escribir un color, una sombra o un radio literal dentro de un bloque. Sobrevive al cambio de estilo y rompe la promesa del sistema.
- **Don't** pintar superficies grandes con los colores dos y tres de la marca. Son fondos de botón, no de sección.
- **Don't** agregar una tercera familia tipográfica. Solo hay títulos y texto.
- **Don't** entregar algo que se parezca a un SaaS genérico en inglés: degradado morado, ilustraciones isométricas, promesas abstractas. No le habla a una pyme chilena ni a su público.
- **Don't** recurrir al repertorio de agencia de los 2010: parallax, carruseles infinitos, contadores animados sin motivo, scroll secuestrado. Efecto por el efecto, y además lento en celular.
- **Don't** caer en el corporativo frío: azul institucional, fotos de reuniones sonrientes, lenguaje de folleto. Sin persona, sin lugar, sin nada que distinga un negocio de otro.
- **Don't** inventar testimonios, cifras, logos de clientes ni casos de éxito para llenar un bloque. Si no hay contenido real, el bloque no va.

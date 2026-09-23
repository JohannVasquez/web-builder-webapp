export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const clampLevel = (level: number): HeadingLevel =>
  Math.min(6, Math.max(1, Math.round(level))) as HeadingLevel;

// Tabla fija en vez de un template string: así un bloque puede indexarla directo (`HEADING_TAGS[level]`)
// sin pasar por una función, que el linter de React trataría como un componente creado en cada render.
export const HEADING_TAGS: Readonly<Record<HeadingLevel, HeadingTag>> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

// El nivel lo decide `SectionRenderer` según la posición de la sección, nunca el bloque (Spec 6.3).
export const headingTag = (level: number): HeadingTag => HEADING_TAGS[clampLevel(level)];

// Un nivel más profundo que `level`, para el subtítulo de cada item dentro de un bloque.
export const subHeadingLevel = (level: number): HeadingLevel => clampLevel(level + 1);
export const subHeadingTag = (level: number): HeadingTag =>
  HEADING_TAGS[subHeadingLevel(level)];

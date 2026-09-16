import type { VisualStyleDefinition } from './VisualStyle';
import { classic } from './styles/classic';
import { glassmorphism } from './styles/glassmorphism';
import { neoBrutalism } from './styles/neoBrutalism';
import { minimal } from './styles/minimal';
import { softUi } from './styles/softUi';
import { bento } from './styles/bento';
import { editorial } from './styles/editorial';
import { aurora } from './styles/aurora';

// Agregar un estilo es agregar un archivo y una línea aquí. Ningún bloque cambia.
export const VISUAL_STYLES: readonly VisualStyleDefinition[] = [
  classic,
  glassmorphism,
  neoBrutalism,
  minimal,
  softUi,
  bento,
  editorial,
  aurora,
];

export const DEFAULT_VISUAL_STYLE_ID = 'classic';

export const findVisualStyle = (id: string): VisualStyleDefinition =>
  VISUAL_STYLES.find((style) => style.id === id) ??
  (VISUAL_STYLES.find(
    (style) => style.id === DEFAULT_VISUAL_STYLE_ID,
  ) as VisualStyleDefinition);

export const VISUAL_STYLE_IDS: readonly string[] = VISUAL_STYLES.map((style) => style.id);

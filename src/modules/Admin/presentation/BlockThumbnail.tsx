import type { ReactElement } from 'react';
import { blockThumbnailRects, type ThumbnailTone } from '../domain/blockCatalog';

const TONE_CLASSES: Readonly<Record<ThumbnailTone, string>> = {
  accent: 'fill-primary/70',
  solid: 'fill-foreground/60',
  muted: 'fill-muted-foreground/25',
};

export interface BlockThumbnailProps {
  readonly type: string;
}

// Esquema visual del bloque para el catálogo de "agregar bloque": rectángulos que insinúan
// su forma, no una captura de pantalla. Sin hooks, para poder probarla con
// `renderToStaticMarkup` igual que el resto de los componentes puros del módulo.
export function BlockThumbnail({ type }: BlockThumbnailProps): ReactElement {
  return (
    <svg
      viewBox="0 0 100 60"
      role="img"
      aria-label={`Esquema del bloque ${type}`}
      className="bg-muted/40 h-16 w-full shrink-0 rounded-md"
    >
      {blockThumbnailRects(type).map((rect, index) => (
        <rect
          key={index}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx={1.5}
          className={TONE_CLASSES[rect.tone]}
        />
      ))}
    </svg>
  );
}

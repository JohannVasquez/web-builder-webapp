import { NextResponse } from 'next/server';
import { BLOCK_CATALOG } from '@/modules/Admin/domain/blockCatalog';
import { blockPropsHint } from '@/modules/Admin/domain/blockHints';
import { VISUAL_STYLES } from '@/modules/VisualStyle/domain/registry';
import { COMPONENT_MAP } from '@/modules/Page/presentation/componentMap';
import {
  CONTENT_WIDTH_VALUES,
  PADDING_Y_VALUES,
  TEXT_ALIGN_VALUES,
} from '@/shared/lib/sectionLayout';

// Autodescripción de la plataforma (SPEC 10.5). Vive aquí, donde están los componentes, y
// no en la API: es lo único que hace que agregar un bloque o un estilo lo publique solo
// para los agentes, sin tocar el MCP.
//
// La lista de bloques se cruza con `COMPONENT_MAP`, que es lo que de verdad se renderiza:
// así un bloque descrito pero no registrado (o al revés) se nota aquí y no en producción.
export function GET(): NextResponse {
  const registered = Object.keys(COMPONENT_MAP);
  const described = new Set(BLOCK_CATALOG.map((entry) => entry.type));

  return NextResponse.json({
    blocks: registered.map((type) => {
      const entry = BLOCK_CATALOG.find((candidate) => candidate.type === type);
      return {
        type,
        label: entry?.label ?? type,
        description: entry?.description ?? '',
        props: blockPropsHint(type),
      };
    }),
    undescribedBlocks: registered.filter((type) => !described.has(type)),
    visualStyles: VISUAL_STYLES.map((style) => ({
      id: style.id,
      label: style.label,
      description: style.description,
    })),
    commonBlockOptions: {
      paddingY: PADDING_Y_VALUES,
      contentWidth: CONTENT_WIDTH_VALUES,
      textAlign: TEXT_ALIGN_VALUES,
      animation: ['none', 'fade', 'slide'],
      hideOn: [null, 'mobile', 'desktop'],
    },
  });
}

import type { ReactElement } from 'react';
import type { PageSection } from '../domain/Page';
import { resolveSectionComponent } from './componentMap';

interface SectionRendererProps {
  readonly sections: readonly PageSection[];
}

/**
 * Itera las secciones dictadas por la base de datos y renderiza cada bloque
 * usando el diccionario de componentes. Los tipos desconocidos se ignoran
 * silenciosamente (AC1.5).
 */
export function SectionRenderer({ sections }: SectionRendererProps): ReactElement {
  const ordered = [...sections].sort((a, b) => a.position - b.position);

  return (
    <>
      {ordered.map((section) => {
        const Component = resolveSectionComponent(section.type);
        if (Component === undefined) {
          return null;
        }
        return (
          <Component
            key={`${section.type}-${section.position}`}
            sectionProps={section.props}
          />
        );
      })}
    </>
  );
}

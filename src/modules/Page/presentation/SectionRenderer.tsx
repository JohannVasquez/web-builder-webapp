import type { ReactElement } from 'react';
import type { PageSection } from '../domain/Page';
import { resolveSectionComponent } from './componentMap';

interface SectionRendererProps {
  readonly sections: readonly PageSection[];
}

/**
 * Itera las secciones dictadas por la base de datos y renderiza cada bloque
 * usando el diccionario de componentes. Los tipos desconocidos se ignoran
 * silenciosamente (AC1.5). Las secciones con `anchor` se envuelven con un id
 * para poder enlazarlas como `/slug#ancla` (sitios one-page).
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
        const key = `${section.type}-${section.position}`;
        if (section.anchor !== null && section.anchor !== '') {
          return (
            <div key={key} id={section.anchor} className="scroll-mt-16">
              <Component sectionProps={section.props} />
            </div>
          );
        }
        return <Component key={key} sectionProps={section.props} />;
      })}
    </>
  );
}

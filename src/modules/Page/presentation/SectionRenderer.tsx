import type { ReactElement } from 'react';
import type { BlogService } from '@/modules/Blog/application/BlogService';
import type { StoreService } from '@/modules/Store/application/StoreService';
import type { PageSection } from '../domain/Page';
import { resolveSectionComponent } from './componentMap';
import type { SectionComponentProps } from './SectionComponentProps';

interface SectionRendererProps {
  readonly sections: readonly PageSection[];
  readonly blogService?: BlogService;
  readonly storeService?: StoreService;
}

// `blogService`/`storeService` son instancias de clase: pasarlas como prop a un bloque que
// es un Client Component ("use client", ej. `Hero`) rompe la serialización RSC ("Only plain
// objects... can be passed to Client Components"). Solo `LatestPosts` y `FeaturedProducts`
// las necesitan (son Server Components async que las usan EN el render), así que son las
// únicas dos que las reciben; el resto ni se entera de que existen.
const dataProps = (
  type: string,
  blogService: BlogService | undefined,
  storeService: StoreService | undefined,
): Partial<SectionComponentProps> => {
  if (type === 'LatestPosts') {
    return { blogService };
  }
  if (type === 'FeaturedProducts') {
    return { storeService };
  }
  return {};
};

// Itera las secciones dictadas por la base de datos y renderiza cada bloque usando el
// diccionario de componentes. Los tipos desconocidos se ignoran en silencio (AC1.5). Las
// secciones con `anchor` se envuelven con un id para poder enlazarlas como `/slug#ancla`.
export function SectionRenderer({
  sections,
  blogService,
  storeService,
}: SectionRendererProps): ReactElement {
  const ordered = [...sections].sort((a, b) => a.position - b.position);

  return (
    <>
      {ordered.map((section) => {
        const Component = resolveSectionComponent(section.type);
        if (Component === undefined) {
          return null;
        }
        const key = `${section.type}-${section.position}`;
        const extra = dataProps(section.type, blogService, storeService);
        if (section.anchor !== null && section.anchor !== '') {
          return (
            <div key={key} id={section.anchor} className="scroll-mt-16">
              <Component sectionProps={section.props} {...extra} />
            </div>
          );
        }
        return <Component key={key} sectionProps={section.props} {...extra} />;
      })}
    </>
  );
}

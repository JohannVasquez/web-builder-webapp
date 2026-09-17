import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
} from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import { ProductCard } from '@/modules/Store/presentation/ProductCard';
import type { SectionComponentProps } from '../SectionComponentProps';

const DEFAULT_LIMIT = 4;

const FeaturedProductsPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  limit: z.number().int().positive().default(DEFAULT_LIMIT).catch(DEFAULT_LIMIT),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
});

// Igual que `LatestPosts` con el blog: el único bloque de la tienda que necesita datos de
// otro módulo. `storeService` viaja por `SectionComponentProps` desde `SectionRenderer`, ya
// construido por la página del tenant (`src/app`): un componente de `presentation` no puede
// depender de `infrastructure` (regla `boundaries/dependencies`). Sin él, o sin productos
// (tienda apagada, sin destacados), el bloque no se muestra.
export async function FeaturedProducts({
  sectionProps,
  storeService,
}: SectionComponentProps): Promise<ReactElement | null> {
  const parsed = FeaturedProductsPropsSchema.safeParse(sectionProps);
  if (!parsed.success || storeService === undefined) {
    return null;
  }
  const { eyebrow, title, limit } = parsed.data;

  const products = await storeService.getFeaturedProducts(limit);
  if (products.length === 0) {
    return null;
  }

  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'normal',
    contentWidth: 'wide',
    textAlign: 'left',
  });

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {eyebrow !== undefined && (
          <p
            className={cn(
              'mb-2 text-sm font-semibold tracking-wide uppercase',
              hasBackgroundImage && 'text-white/80',
            )}
          >
            {eyebrow}
          </p>
        )}
        {title !== '' && (
          <h2
            className={cn(
              'ui-heading mb-8 text-3xl md:text-4xl',
              hasBackgroundImage && 'text-white',
            )}
          >
            {title}
          </h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              lightText={hasBackgroundImage}
            />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

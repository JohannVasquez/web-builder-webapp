import type { ReactElement } from 'react';
import { z } from 'zod';
import { ExternalLink } from 'lucide-react';
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
import type { SectionComponentProps } from '../SectionComponentProps';

const LocationMapPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  /**
   * Dirección en texto libre (ej. "Av. Vicuña Mackenna 2890, Ñuñoa,
   * Santiago"). Se usa tanto para el mapa embebido como para el link a
   * Google Maps cuando no hay `lat`/`lng`.
   */
  address: z.string().optional(),
  /** Coordenadas exactas; si vienen junto a `address`, tienen prioridad. */
  lat: z.number().optional(),
  lng: z.number().optional(),
  mapLabel: z.string().default('Ver en Google Maps'),
});

/**
 * Mapa de ubicación con link a Google Maps. Sección opcional: sin
 * `address` (ni `lat`/`lng`) no se renderiza nada — un tenant sin oficina
 * física, o que prefiere no publicar su dirección, simplemente no agrega
 * esta sección a su página.
 *
 * El embed no requiere API key de Google (usa el endpoint público
 * `maps.google.com/maps?...&output=embed`, distinto de la Maps Embed API
 * que sí la exige); el link "Ver en Google Maps" usa el esquema oficial
 * `google.com/maps/search/?api=1&query=...`, que además abre la app nativa
 * en celulares.
 */
export function LocationMap({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = LocationMapPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, accentColor, address, lat, lng, mapLabel } = parsed.data;

  const query = lat !== undefined && lng !== undefined ? `${lat},${lng}` : address;
  if (query === undefined || query === '') {
    return null;
  }

  const encodedQuery = encodeURIComponent(query);
  const embedSrc = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
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
        {(title !== undefined || subtitle !== undefined) && (
          <div className="mb-10 text-center">
            {title !== undefined && (
              <h2
                className={cn(
                  'ui-heading text-3xl md:text-4xl',
                  hasBackgroundImage && 'text-white',
                )}
              >
                {title}
              </h2>
            )}
            {subtitle !== undefined && (
              <p
                className={cn(
                  'mt-3',
                  hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="ui-card overflow-hidden">
          <iframe
            src={embedSrc}
            title={title ?? 'Ubicación en el mapa'}
            className="h-96 w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            {address !== undefined && (
              <p className="text-muted-foreground text-sm">{address}</p>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:underline"
              style={accentColor !== undefined ? { color: accentColor } : undefined}
            >
              {mapLabel}
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

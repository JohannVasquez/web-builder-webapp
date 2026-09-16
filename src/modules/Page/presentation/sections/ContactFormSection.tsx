import type { ReactElement } from 'react';
import { z } from 'zod';
import { ExternalLink } from 'lucide-react';
import { ContactForm } from '@/modules/Contact/presentation/ContactForm';
import { ContactChannels } from '@/modules/Contact/presentation/ContactChannels';
import { ContactChannelSchema } from '@/modules/Contact/domain/ContactChannelSchema';
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

const CONTACT_FORM_SECTION_VARIANTS = ['channels', 'form', 'map'] as const;

const ContactFormSectionPropsSchema = z.object({
  title: z.string().default('Contáctanos'),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  // Panel lateral con teléfono, WhatsApp, email copiable y horario; sin este array, solo el formulario.
  channels: z.array(ContactChannelSchema).default([]),
  // `channels` (default): formulario y, si hay, panel de canales. `form`: solo el formulario, centrado. `map`: formulario junto al mapa (usa `address`/`lat`/`lng`); sin esas props cae a `channels`.
  variant: z.enum(CONTACT_FORM_SECTION_VARIANTS).default('channels').catch('channels'),
  // Mismas props que `LocationMap`, solo para el variant `map`.
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  mapLabel: z.string().default('Ver en Google Maps'),
});

function SectionHeading({
  title,
  subtitle,
  hasBackgroundImage,
}: {
  readonly title: string;
  readonly subtitle: string | undefined;
  readonly hasBackgroundImage: boolean;
}): ReactElement {
  return (
    <div className="mb-10 text-center">
      <h2
        className={cn(
          'ui-heading text-3xl md:text-4xl',
          hasBackgroundImage && 'text-white',
        )}
      >
        {title}
      </h2>
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
  );
}

export function ContactFormSection({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = ContactFormSectionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, accentColor, channels, address, lat, lng, mapLabel } =
    parsed.data;
  const hasChannels = channels.length > 0;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;

  const mapQuery = lat !== undefined && lng !== undefined ? `${lat},${lng}` : address;
  const hasMapQuery = mapQuery !== undefined && mapQuery !== '';
  // El variant `map` sin dirección ni coordenadas no tiene nada que mostrar: se comporta como `channels`.
  const variant =
    parsed.data.variant === 'map' && !hasMapQuery ? 'channels' : parsed.data.variant;

  if (variant === 'map' && mapQuery !== undefined) {
    const encodedQuery = encodeURIComponent(mapQuery);
    const embedSrc = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    const layout = sectionLayoutClasses(parsed.data, {
      paddingY: 'normal',
      contentWidth: 'wide',
      textAlign: 'left',
    });

    return (
      <section
        className={cn(!hasBackgroundImage && 'ui-surface', layout.section)}
        style={sectionBackgroundStyle(parsed.data)}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          <SectionHeading
            title={title}
            subtitle={subtitle}
            hasBackgroundImage={hasBackgroundImage}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="ui-card p-6 md:p-8">
              <ContactForm />
            </div>
            <div className="ui-card flex flex-col overflow-hidden">
              <iframe
                src={embedSrc}
                title={title}
                className="h-64 w-full flex-1"
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
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'form') {
    const layout = sectionLayoutClasses(parsed.data, {
      paddingY: 'normal',
      contentWidth: 'tight',
      textAlign: 'left',
    });

    return (
      <section
        className={cn(!hasBackgroundImage && 'ui-surface', layout.section)}
        style={sectionBackgroundStyle(parsed.data)}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          <SectionHeading
            title={title}
            subtitle={subtitle}
            hasBackgroundImage={hasBackgroundImage}
          />
          {hasBackgroundImage ? (
            <div className="ui-card p-6 md:p-8">
              <ContactForm />
            </div>
          ) : (
            <ContactForm />
          )}
        </RevealOnScroll>
      </section>
    );
  }

  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'normal',
    contentWidth: hasChannels ? 'wide' : 'tight',
    textAlign: 'left',
  });

  return (
    <section
      className={cn(!hasBackgroundImage && 'ui-surface', layout.section)}
      style={sectionBackgroundStyle(parsed.data)}
      {...sectionSurfaceAttributes(parsed.data)}
      data-variant={variant}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        <SectionHeading
          title={title}
          subtitle={subtitle}
          hasBackgroundImage={hasBackgroundImage}
        />
        {hasChannels ? (
          <div className="grid gap-8 md:grid-cols-[7fr_3fr]">
            <div className="ui-card p-6 md:p-8">
              <ContactForm />
            </div>
            <ContactChannels items={channels} accentColor={accentColor} />
          </div>
        ) : hasBackgroundImage ? (
          <div className="ui-card p-6 md:p-8">
            <ContactForm />
          </div>
        ) : (
          <ContactForm />
        )}
      </RevealOnScroll>
    </section>
  );
}

import type { ReactElement } from 'react';
import { z } from 'zod';
import { ContactForm } from '@/modules/Contact/presentation/ContactForm';
import { ContactChannels } from '@/modules/Contact/presentation/ContactChannels';
import { ContactChannelSchema } from '@/modules/Contact/domain/ContactChannelSchema';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import { SectionLayoutPropsSchema, sectionLayoutClasses } from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const ContactFormSectionPropsSchema = z.object({
  title: z.string().default('Contáctanos'),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  /**
   * Panel lateral con teléfono, WhatsApp, email copiable y horario de
   * atención. Sin este array (el default), la sección se ve igual que
   * antes: solo el formulario, centrado.
   */
  channels: z.array(ContactChannelSchema).default([]),
});

export function ContactFormSection({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = ContactFormSectionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, accentColor, channels } = parsed.data;
  const hasChannels = channels.length > 0;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
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
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
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

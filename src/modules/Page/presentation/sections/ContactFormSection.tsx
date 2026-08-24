import type { ReactElement } from 'react';
import { z } from 'zod';
import { ContactForm } from '@/modules/Contact/presentation/ContactForm';
import { ContactChannels } from '@/modules/Contact/presentation/ContactChannels';
import { ContactChannelSchema } from '@/modules/Contact/domain/ContactChannelSchema';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
} from '@/shared/lib/sectionBackground';
import type { SectionComponentProps } from '../SectionComponentProps';

const ContactFormSectionPropsSchema = z.object({
  title: z.string().default('Contáctanos'),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
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

  return (
    <section
      className={cn(!hasBackgroundImage && 'bg-secondary/50')}
      style={sectionBackgroundStyle(parsed.data)}
    >
      <div className={cn('mx-auto px-6 py-20', hasChannels ? 'max-w-6xl' : 'max-w-2xl')}>
        <div className="mb-10 text-center">
          <h2
            className={cn(
              'text-3xl font-bold tracking-tight md:text-4xl',
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
            <div className="bg-card rounded-2xl border p-6 shadow-sm md:p-8">
              <ContactForm />
            </div>
            <ContactChannels items={channels} accentColor={accentColor} />
          </div>
        ) : hasBackgroundImage ? (
          <div className="bg-card rounded-2xl border p-6 shadow-sm md:p-8">
            <ContactForm />
          </div>
        ) : (
          <ContactForm />
        )}
      </div>
    </section>
  );
}

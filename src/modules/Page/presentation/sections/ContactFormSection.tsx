import type { ReactElement } from 'react';
import { z } from 'zod';
import { ContactForm } from '@/modules/Contact/presentation/ContactForm';
import type { SectionComponentProps } from '../SectionComponentProps';

const ContactFormSectionPropsSchema = z.object({
  title: z.string().default('Contáctanos'),
  subtitle: z.string().optional(),
});

export function ContactFormSection({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = ContactFormSectionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle } = parsed.data;

  return (
    <section className="bg-secondary/50">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          {subtitle !== undefined && (
            <p className="text-muted-foreground mt-3">{subtitle}</p>
          )}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

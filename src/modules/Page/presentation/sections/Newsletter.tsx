'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import { HEADING_TAGS } from '@/shared/lib/heading';
import type { SectionComponentProps } from '../SectionComponentProps';

const NEWSLETTER_VARIANTS = ['inline', 'card'] as const;

const NEWSLETTER_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof NEWSLETTER_VARIANTS)[number], SectionLayoutDefaults>
> = {
  inline: { paddingY: 'normal', contentWidth: 'medium', textAlign: 'center' },
  card: { paddingY: 'normal', contentWidth: 'tight', textAlign: 'center' },
};

const NewsletterPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  subtitle: z.string().optional(),
  buttonLabel: z.string().default('Suscribirme'),
  successMessage: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `inline` (default, campo y botón en una fila) o `card` (dentro de una tarjeta centrada).
  variant: z.enum(NEWSLETTER_VARIANTS).default('inline').catch('inline'),
});

const EmailSchema = z.email('Ingresa un correo electrónico válido');
const DEFAULT_SUCCESS_MESSAGE = 'Listo. Revisa tu correo para confirmar la suscripción.';
const GENERIC_ERROR =
  'No pudimos completar tu suscripción. Inténtalo nuevamente en unos minutos.';
const RATE_LIMIT_ERROR = 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
const TOO_MANY_REQUESTS_STATUS = 429;

type Status = 'idle' | 'submitting' | 'success';

// Mismo patrón que `ContactService`: el dominio del visitante viaja en `X-Tenant-Domain` porque,
// llamando a la API cross-origin, el `Host` que ella ve es el suyo propio.
async function submitNewsletter(email: string, website: string): Promise<void> {
  const response = await fetch(`${getPublicApiBaseUrl()}/api/newsletter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(typeof window === 'undefined'
        ? {}
        : { [TENANT_DOMAIN_HEADER]: window.location.hostname }),
    },
    body: JSON.stringify({ email, website }),
  });

  if (response.status === TOO_MANY_REQUESTS_STATUS) {
    throw new Error('rate-limited');
  }
  if (!response.ok) {
    throw new Error('request-failed');
  }
}

export function Newsletter({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
  const parsed = NewsletterPropsSchema.safeParse(sectionProps);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  if (!parsed.success || parsed.data.title === '') {
    return null;
  }
  const { eyebrow, title, subtitle, buttonLabel, successMessage, variant } = parsed.data;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, NEWSLETTER_LAYOUT_DEFAULTS[variant]);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const validation = EmailSchema.safeParse(email);
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ?? 'Ingresa un correo electrónico válido',
      );
      return;
    }
    setError(undefined);
    setStatus('submitting');
    submitNewsletter(validation.data, website)
      .then(() => {
        setStatus('success');
      })
      .catch((cause: unknown) => {
        const isRateLimited = cause instanceof Error && cause.message === 'rate-limited';
        setError(isRateLimited ? RATE_LIMIT_ERROR : GENERIC_ERROR);
        setStatus('idle');
      });
  };

  const header = (
    <div className="flex flex-col items-center gap-2">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          'ui-heading text-3xl md:text-4xl',
          hasBackgroundImage && 'text-white',
        )}
      >
        {title}
      </Heading>
      {subtitle !== undefined && (
        <p
          className={cn(
            'max-w-xl text-pretty',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  const form =
    status === 'success' ? (
      <p
        className={cn(
          'mt-6 font-medium',
          hasBackgroundImage ? 'text-white' : 'text-foreground',
        )}
      >
        {successMessage ?? DEFAULT_SUCCESS_MESSAGE}
      </p>
    ) : (
      <form onSubmit={onSubmit} className="relative mt-6 w-full max-w-md" noValidate>
        {/* Trampa para bots: fuera de pantalla y oculta a lectores, no con display:none. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="newsletter-website">No completar</label>
          <input
            id="newsletter-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Correo electrónico
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error !== undefined}
              aria-describedby={
                error !== undefined ? 'newsletter-email-error' : undefined
              }
            />
            {error !== undefined && (
              <p id="newsletter-email-error" className="text-destructive mt-1.5 text-sm">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" disabled={status === 'submitting'} className="shrink-0">
            {status === 'submitting' ? (
              <>
                <Loader2 className="animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Mail /> {buttonLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    );

  if (variant === 'card') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(layout.container, 'flex justify-center')}
        >
          <div className="ui-card flex w-full flex-col items-center gap-2 p-8 text-center md:p-10">
            {header}
            {form}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll
        animation={parsed.data.animation}
        className={cn(layout.container, 'flex flex-col items-center')}
      >
        {header}
        {form}
      </RevealOnScroll>
    </section>
  );
}

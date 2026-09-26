'use client';

import type { ComponentType, FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import NextLink from 'next/link';
import { CookiePreferencesButton } from '@/modules/Consent/presentation/CookiePreferencesButton';
import { Link as LinkIcon, Mail, MapPin, Phone } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { cn } from '@/shared/lib/utils';
import type { GlobalSettings } from '../domain/GlobalSettings';

const FOOTER_VARIANTS = ['simple', 'columns', 'newsletter'] as const;
type FooterVariant = (typeof FOOTER_VARIANTS)[number];

interface FooterProps {
  readonly settings: GlobalSettings;
  // `simple`: una fila con logo, redes y copyright. `columns` (default): lo actual. `newsletter`: `columns` más una columna de suscripción.
  readonly variant?: FooterVariant;
  // Sin este callback, la columna de suscripción solo explica que se activa con el bloque de novedades.
  readonly onSubscribe?: (email: string) => void | Promise<void>;
  // Enlaces a las páginas legales publicadas (privacidad, términos, cookies, etc.)
  readonly legalLinks?: readonly { readonly href: string; readonly label: string }[];
}

// Tipa el ícono por lo único que usamos: lucide y react-icons no comparten tipo, pero sí `className`.
interface SocialLink {
  readonly url: string;
  readonly label: string;
  readonly Icon: ComponentType<{ className?: string }>;
}

function socialLinksOf(settings: GlobalSettings): readonly SocialLink[] {
  return [
    { url: settings.instagramUrl, label: 'Instagram', Icon: FaInstagram },
    { url: settings.facebookUrl, label: 'Facebook', Icon: FaFacebookF },
    { url: settings.tiktokUrl, label: 'TikTok', Icon: FaTiktok },
    { url: settings.linkedinUrl, label: 'LinkedIn', Icon: FaLinkedinIn },
    { url: settings.youtubeUrl, label: 'YouTube', Icon: FaYoutube },
    { url: settings.xUrl, label: 'X', Icon: FaXTwitter },
    {
      url: settings.customLinkUrl,
      label: settings.customLinkLabel !== '' ? settings.customLinkLabel : 'Enlace',
      Icon: LinkIcon,
    },
  ].filter((social) => social.url !== '');
}

function FooterLogo({ settings }: { readonly settings: GlobalSettings }): ReactElement {
  const { logoLight, logoDark } = settings.brand.assets;
  if (logoLight === undefined) {
    return <p className="text-lg font-bold">{settings.siteName}</p>;
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- Ratio desconocido: next/image sin dimensiones rompe w-auto o exige contenedor fijo */}
      <img
        src={logoLight}
        alt={settings.siteName}
        loading="lazy"
        decoding="async"
        className={logoDark !== undefined ? 'h-9 w-auto dark:hidden' : 'h-9 w-auto'}
      />
      {logoDark !== undefined && (
        // eslint-disable-next-line @next/next/no-img-element -- Ratio desconocido: next/image sin dimensiones rompe w-auto o exige contenedor fijo
        <img
          src={logoDark}
          alt={settings.siteName}
          loading="lazy"
          decoding="async"
          className="hidden h-9 w-auto dark:block"
        />
      )}
    </>
  );
}

function SocialIcons({
  items,
}: {
  readonly items: readonly SocialLink[];
}): ReactElement | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}

function NewsletterColumn({
  onSubscribe,
}: {
  readonly onSubscribe: ((email: string) => void | Promise<void>) | undefined;
}): ReactElement {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (onSubscribe === undefined) {
      return;
    }
    const email = new FormData(event.currentTarget).get('email');
    if (typeof email === 'string' && email !== '') {
      void onSubscribe(email);
      setStatus('sent');
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="font-semibold">Novedades</p>
      {onSubscribe === undefined ? (
        <p className="text-muted-foreground">
          La suscripción se activa junto con el bloque de novedades.
        </p>
      ) : status === 'sent' ? (
        <p className="text-muted-foreground">Gracias por suscribirte.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="Tu correo"
            aria-label="Correo electrónico"
            className="ui-input min-w-0 flex-1 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="ui-button bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Suscribirme
          </button>
        </form>
      )}
    </div>
  );
}

export function Footer({
  settings,
  variant = 'columns',
  onSubscribe,
  legalLinks,
}: FooterProps): ReactElement {
  const resolvedVariant: FooterVariant = FOOTER_VARIANTS.includes(variant)
    ? variant
    : 'columns';
  const year = new Date().getFullYear();
  const socialLinks = socialLinksOf(settings);

  if (resolvedVariant === 'simple') {
    return (
      <footer className="bg-secondary/40 border-t" data-variant={resolvedVariant}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <FooterLogo settings={settings} />
          <SocialIcons items={socialLinks} />
          <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 text-xs">
            <span>
              © {year} {settings.siteName}. Todos los derechos reservados.
            </span>
            {legalLinks?.map((link) => (
              <NextLink key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </NextLink>
            ))}
            <CookiePreferencesButton />
          </p>
        </div>
      </footer>
    );
  }

  const isNewsletter = resolvedVariant === 'newsletter';

  return (
    <footer className="bg-secondary/40 border-t" data-variant={resolvedVariant}>
      <div
        className={cn(
          'mx-auto grid max-w-6xl gap-10 px-6 py-12',
          isNewsletter ? 'md:grid-cols-4' : 'md:grid-cols-3',
        )}
      >
        <div>
          <FooterLogo settings={settings} />
          {settings.tagline !== '' && (
            <p className="text-muted-foreground mt-2 text-sm">{settings.tagline}</p>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Contacto</p>
          {settings.contactEmail !== '' && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <Mail className="size-4" /> {settings.contactEmail}
            </a>
          )}
          {settings.contactPhone !== '' && (
            <p className="text-muted-foreground flex items-center gap-2">
              <Phone className="size-4" /> {settings.contactPhone}
            </p>
          )}
          {settings.address !== '' && (
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4" /> {settings.address}
            </p>
          )}
        </div>
        {socialLinks.length > 0 && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Síguenos</p>
            <SocialIcons items={socialLinks} />
          </div>
        )}
        {isNewsletter && <NewsletterColumn onSubscribe={onSubscribe} />}
      </div>
      <div className="border-t py-4 text-center">
        <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 text-xs">
          <span>
            © {year} {settings.siteName}. Todos los derechos reservados.
          </span>
          {legalLinks?.map((link) => (
            <NextLink key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </NextLink>
          ))}
          <CookiePreferencesButton />
        </p>
      </div>
    </footer>
  );
}

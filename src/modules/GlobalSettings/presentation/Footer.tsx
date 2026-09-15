import type { ReactElement } from 'react';
import { Link as LinkIcon, Mail, MapPin, Phone } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import type { ComponentType } from 'react';
import type { GlobalSettings } from '../domain/GlobalSettings';

interface FooterProps {
  readonly settings: GlobalSettings;
}

// Tipa el ícono por lo único que usamos: lucide y react-icons no comparten tipo, pero sí `className`.
interface SocialLink {
  readonly url: string;
  readonly label: string;
  readonly Icon: ComponentType<{ className?: string }>;
}

export function Footer({ settings }: FooterProps): ReactElement {
  const year = new Date().getFullYear();
  const { logoLight, logoDark } = settings.brand.assets;

  const socialLinks: readonly SocialLink[] = [
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

  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          {logoLight !== undefined ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
              <img
                src={logoLight}
                alt={settings.siteName}
                className={
                  logoDark !== undefined ? 'h-9 w-auto dark:hidden' : 'h-9 w-auto'
                }
              />
              {logoDark !== undefined && (
                // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                <img
                  src={logoDark}
                  alt={settings.siteName}
                  className="hidden h-9 w-auto dark:block"
                />
              )}
            </>
          ) : (
            <p className="text-lg font-bold">{settings.siteName}</p>
          )}
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
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ url, label, Icon }) => (
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
          </div>
        )}
      </div>
      <div className="border-t py-4 text-center">
        <p className="text-muted-foreground text-xs">
          © {year} {settings.siteName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

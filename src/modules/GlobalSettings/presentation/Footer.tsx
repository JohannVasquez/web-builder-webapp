import type { ReactElement } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { GlobalSettings } from '../domain/GlobalSettings';

function InstagramIcon({ className }: { readonly className?: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { readonly className?: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface FooterProps {
  readonly settings: GlobalSettings;
}

export function Footer({ settings }: FooterProps): ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{settings.siteName}</p>
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
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Síguenos</p>
          <div className="flex gap-3">
            {settings.instagramUrl !== '' && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground"
              >
                <InstagramIcon className="size-5" />
              </a>
            )}
            {settings.facebookUrl !== '' && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-foreground"
              >
                <FacebookIcon className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center">
        <p className="text-muted-foreground text-xs">
          © {year} {settings.siteName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

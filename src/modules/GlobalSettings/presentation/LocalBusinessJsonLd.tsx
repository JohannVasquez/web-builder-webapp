import type { ReactElement } from 'react';
import type { GlobalSettings } from '../domain/GlobalSettings';

interface LocalBusinessJsonLdProps {
  readonly settings: GlobalSettings;
  readonly siteUrl: string;
}

const socialProfiles = (settings: GlobalSettings): string[] =>
  [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.tiktokUrl,
    settings.linkedinUrl,
    settings.youtubeUrl,
    settings.xUrl,
  ].filter((url) => url !== '');

// Datos estructurados de negocio local: es lo que hace que un buscador entienda el nombre,
// la dirección y el teléfono como un negocio y no como texto suelto (SPEC 6.1).
export function LocalBusinessJsonLd({
  settings,
  siteUrl,
}: LocalBusinessJsonLdProps): ReactElement | null {
  if (settings.address === '' && settings.contactPhone === '') {
    return null;
  }

  const profiles = socialProfiles(settings);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.siteName,
    ...(settings.tagline === '' ? {} : { description: settings.tagline }),
    url: siteUrl,
    ...(settings.contactPhone === '' ? {} : { telephone: settings.contactPhone }),
    ...(settings.contactEmail === '' ? {} : { email: settings.contactEmail }),
    ...(settings.address === ''
      ? {}
      : { address: { '@type': 'PostalAddress', streetAddress: settings.address } }),
    ...(settings.brand.assets.logoLight === undefined
      ? {}
      : { logo: `${siteUrl}/brand-asset/logo-light` }),
    ...(profiles.length === 0 ? {} : { sameAs: profiles }),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale de datos del propio cliente, ya validados por el schema de settings.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

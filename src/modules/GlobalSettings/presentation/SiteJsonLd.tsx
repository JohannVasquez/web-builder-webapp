import type { ReactElement } from 'react';
import type { GlobalSettings } from '../domain/GlobalSettings';

interface SiteJsonLdProps {
  readonly settings: GlobalSettings;
  readonly siteUrl: string;
  // La búsqueda del sitio vive en la tienda: sin tienda encendida no hay qué buscar.
  readonly hasStore: boolean;
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

// Un `LocalBusiness` ya ES una organización: emitir además un `Organization` aparte crearía
// dos entidades para el mismo negocio y el buscador tendría que adivinar cuál manda. Por eso
// hay un solo nodo, con el tipo más específico que los datos permitan sostener, y todo lo
// demás lo referencia por `@id`.
const organizationNode = (
  settings: GlobalSettings,
  siteUrl: string,
): Record<string, unknown> => {
  const isLocalBusiness = settings.address !== '' || settings.contactPhone !== '';
  const profiles = socialProfiles(settings);

  return {
    '@type': isLocalBusiness ? 'LocalBusiness' : 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: settings.siteName,
    url: siteUrl,
    ...(settings.tagline === '' ? {} : { description: settings.tagline }),
    ...(settings.contactPhone === '' ? {} : { telephone: settings.contactPhone }),
    ...(settings.contactEmail === '' ? {} : { email: settings.contactEmail }),
    ...(settings.address === ''
      ? {}
      : { address: { '@type': 'PostalAddress', streetAddress: settings.address } }),
    ...(settings.openingHours === '' ? {} : { openingHours: settings.openingHours }),
    ...(settings.brand.assets.logoLight === undefined
      ? {}
      : {
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/brand-asset/logo-light`,
          },
        }),
    ...(profiles.length === 0 ? {} : { sameAs: profiles }),
  };
};

const webSiteNode = (
  settings: GlobalSettings,
  siteUrl: string,
  hasStore: boolean,
): Record<string, unknown> => ({
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: settings.siteName,
  ...(settings.tagline === '' ? {} : { description: settings.tagline }),
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'es-CL',
  ...(hasStore
    ? {
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/tienda?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
    : {}),
});

// Identidad del sitio para un buscador: quién es el negocio y qué es este sitio web. Va en el
// layout del tenant, así que aparece en todas las páginas; el resto de los datos estructurados
// (producto, publicación, migas) cuelgan de estos dos por `@id`.
export function SiteJsonLd({
  settings,
  siteUrl,
  hasStore,
}: SiteJsonLdProps): ReactElement {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(settings, siteUrl),
      webSiteNode(settings, siteUrl, hasStore),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale de datos del propio cliente, ya validados por el schema de settings.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { Navbar } from '@/modules/GlobalSettings/presentation/Navbar';
import { Footer } from '@/modules/GlobalSettings/presentation/Footer';
import { SellerIdentityCard } from '@/modules/Store/presentation/SellerIdentityCard';
import { WhatsAppButton } from '@/modules/GlobalSettings/presentation/WhatsAppButton';
import { BrandStyle } from '@/modules/Brand/presentation/BrandStyle';
import { ThemeScript } from '@/modules/Brand/presentation/ThemeScript';
import { resolveFontPairing } from '@/modules/Brand/presentation/fonts';
import { VisualStyleTokens } from '@/modules/VisualStyle/presentation/VisualStyleTokens';
import { SiteJsonLd } from '@/modules/GlobalSettings/presentation/SiteJsonLd';
import { Analytics } from '@/modules/Analytics/presentation/Analytics';
import { CookieNotice } from '@/modules/Consent/presentation/CookieNotice';
import { resolveCookieNoticeHref } from '@/modules/Consent/domain/Consent';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { readAnalyticsConfig } from '@/modules/Analytics/domain/Analytics';
import {
  isServedAsDemo,
  isUnderConstruction,
} from '@/modules/GlobalSettings/domain/GlobalSettings';
import { DEMO_ACTIONS_BASE_URL } from '@/shared/config/demo';
import { isDemoRequest } from '@/shared/lib/demoAccess';
import { Toaster } from '@/shared/ui/sonner';
import { draftMode } from 'next/headers';
import { TenantProviders } from './providers';

interface TenantLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ tenantDomain: string }>;
}

export async function generateMetadata({
  params,
}: Pick<TenantLayoutProps, 'params'>): Promise<Metadata> {
  const { tenantDomain } = await params;
  const settings = await createGlobalSettingsService(tenantDomain).getSettings();
  const { favicon, ogImage } = settings.brand.assets;

  const dm = await draftMode();
  const isPreview = dm.isEnabled;
  // Por el host, por la cookie del enlace o porque la API lo dijo (`X-Demo: true`): cualquiera
  // de las tres basta para que una demo de prospecto no entre a un buscador.
  const isDemo = isServedAsDemo(settings) || (await isDemoRequest(tenantDomain));

  // Rutas estables en vez de las URLs firmadas del bucket, que expiran en una hora y
  // dejarían sin imagen cualquier enlace ya compartido.
  const brandAsset = (name: string): string => `/brand-asset/${name}`;

  // El canónico apunta al dominio principal del cliente, no a aquel por el que entró el
  // visitante: un tenant con dos dominios no puede competir consigo mismo en buscadores.
  //
  // Aquí se fija solo la base; el canónico concreto lo declara cada página con `canonical()`
  // de `@/shared/lib/seo`. Ponerlo en este layout lo heredarían TODAS las rutas, y cada post
  // y cada producto terminaría señalando a la portada como su versión buena.
  const canonicalHost = settings.primaryDomain ?? tenantDomain;

  // Un sitio en construcción no se indexa entero, aunque cada página diga lo contrario.
  const underConstruction = isUnderConstruction(settings);

  return {
    metadataBase: new URL(`https://${canonicalHost}`),
    ...(underConstruction || isPreview || isDemo
      ? { robots: { index: false, follow: false } }
      : {}),
    verification: {
      ...(settings.googleSiteVerification === ''
        ? {}
        : { google: settings.googleSiteVerification }),
      ...(settings.bingSiteVerification === ''
        ? {}
        : { other: { 'msvalidate.01': settings.bingSiteVerification } }),
    },
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: settings.tagline,
    icons: favicon === undefined ? undefined : { icon: brandAsset('favicon') },
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: settings.siteName,
      description: settings.tagline,
      images: ogImage === undefined ? undefined : [{ url: brandAsset('og-image') }],
    },
    twitter: {
      card: ogImage === undefined ? 'summary' : 'summary_large_image',
      title: settings.siteName,
      description: settings.tagline,
      images: ogImage === undefined ? undefined : [brandAsset('og-image')],
    },
  };
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps): Promise<ReactElement> {
  const { tenantDomain } = await params;
  const dm = await draftMode();
  const isPreview = dm.isEnabled;

  const [settings, links, store, publishedPages] = await Promise.all([
    createGlobalSettingsService(tenantDomain).getSettings(),
    createNavigationService(tenantDomain).getLinks(),
    createStoreService(tenantDomain).getStoreSettings(),
    createPageService(tenantDomain).getPublishedPages(),
  ]);
  const isDemo = isServedAsDemo(settings) || (await isDemoRequest(tenantDomain));
  const legalSlugs = [
    'politica-de-privacidad',
    'terminos-y-condiciones',
    'politica-de-cookies',
    'terminos-de-compra',
  ];
  const legalLinks = publishedPages
    .filter((page) => legalSlugs.includes(page.slug))
    .map((page) => ({ href: `/${page.slug}`, label: page.title }));

  const cookiePolicyHref = resolveCookieNoticeHref(publishedPages);
  const pairing = resolveFontPairing(settings.brand.typography.pairing);

  return (
    // En una demo las acciones del navegador pasan por el servidor de Next, que agrega el
    // token desde la cookie httpOnly (ver `DEMO_ACTIONS_BASE_URL`).
    <TenantProviders apiBaseUrl={isDemo ? DEMO_ACTIONS_BASE_URL : undefined}>
      {/* Además del `robots` de `generateMetadata`: una página que declara su propio `robots`
          (aunque sea `undefined`) pisa el del layout, y una demo no puede depender de eso.
          React lleva esta etiqueta al <head>. Sin franja ni aviso: el vendedor habla en la
          llamada. */}
      {isDemo && <meta name="robots" content="noindex, nofollow" />}
      <ThemeScript colorMode={settings.brand.colorMode} />
      <SiteJsonLd
        settings={settings}
        siteUrl={`https://${settings.primaryDomain ?? tenantDomain}`}
        hasStore={store !== null}
      />
      <BrandStyle
        brand={settings.brand}
        headingVariable={pairing.headingVariableName}
        bodyVariable={pairing.bodyVariableName}
      />
      <VisualStyleTokens styleId={settings.brand.visualStyle} />
      {isPreview && (
        <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium z-50 sticky top-0">
          Estás viendo una vista previa de este sitio. Los cambios en borrador son
          visibles.
        </div>
      )}
      {/* Primer elemento enfocable: permite saltarse el menú sin tabular por todos sus enlaces. */}
      <a
        href="#contenido"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
      >
        Saltar al contenido
      </a>
      <Navbar settings={settings} links={links} showCart={store !== null} />
      <main id="contenido" tabIndex={-1} className="ui-page-backdrop flex-1">
        {children}
      </main>
      {/* Solo en tiendas: identificar al vendedor lo exige el Reglamento de Comercio
          Electrónico, y un sitio sin tienda no vende nada. */}
      {store !== null && (
        <div className="bg-secondary/40 border-t px-6 pt-6">
          <div className="mx-auto max-w-6xl">
            <SellerIdentityCard seller={store.seller} />
          </div>
        </div>
      )}
      <Footer settings={settings} legalLinks={legalLinks} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <Analytics config={readAnalyticsConfig(settings)} />
      <CookieNotice policyHref={cookiePolicyHref} />
      <Toaster position="top-center" richColors />
    </TenantProviders>
  );
}

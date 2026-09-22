import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { Navbar } from '@/modules/GlobalSettings/presentation/Navbar';
import { Footer } from '@/modules/GlobalSettings/presentation/Footer';
import { WhatsAppButton } from '@/modules/GlobalSettings/presentation/WhatsAppButton';
import { BrandStyle } from '@/modules/Brand/presentation/BrandStyle';
import { ThemeScript } from '@/modules/Brand/presentation/ThemeScript';
import { resolveFontPairing } from '@/modules/Brand/presentation/fonts';
import { VisualStyleTokens } from '@/modules/VisualStyle/presentation/VisualStyleTokens';
import { LocalBusinessJsonLd } from '@/modules/GlobalSettings/presentation/LocalBusinessJsonLd';
import { Analytics } from '@/modules/Analytics/presentation/Analytics';
import { readAnalyticsConfig } from '@/modules/Analytics/domain/Analytics';
import { isUnderConstruction } from '@/modules/GlobalSettings/domain/GlobalSettings';
import { Toaster } from '@/shared/ui/sonner';
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
  // Rutas estables en vez de las URLs firmadas del bucket, que expiran en una hora y
  // dejarían sin imagen cualquier enlace ya compartido.
  const brandAsset = (name: string): string => `/brand-asset/${name}`;

  // El canónico apunta al dominio principal del cliente, no a aquel por el que entró el
  // visitante: un tenant con dos dominios no puede competir consigo mismo en buscadores.
  const canonicalHost = settings.primaryDomain ?? tenantDomain;

  // Un sitio en construcción no se indexa entero, aunque cada página diga lo contrario.
  const underConstruction = isUnderConstruction(settings);

  return {
    metadataBase: new URL(`https://${canonicalHost}`),
    ...(underConstruction ? { robots: { index: false, follow: false } } : {}),
    verification: {
      ...(settings.googleSiteVerification === ''
        ? {}
        : { google: settings.googleSiteVerification }),
      ...(settings.bingSiteVerification === ''
        ? {}
        : { other: { 'msvalidate.01': settings.bingSiteVerification } }),
    },
    alternates: { canonical: '/' },
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
  const [settings, links, store] = await Promise.all([
    createGlobalSettingsService(tenantDomain).getSettings(),
    createNavigationService(tenantDomain).getLinks(),
    createStoreService(tenantDomain).getStoreSettings(),
  ]);
  const pairing = resolveFontPairing(settings.brand.typography.pairing);

  return (
    <TenantProviders>
      <ThemeScript colorMode={settings.brand.colorMode} />
      <LocalBusinessJsonLd
        settings={settings}
        siteUrl={`https://${settings.primaryDomain ?? tenantDomain}`}
      />
      <BrandStyle
        brand={settings.brand}
        headingVariable={pairing.headingVariableName}
        bodyVariable={pairing.bodyVariableName}
      />
      <VisualStyleTokens styleId={settings.brand.visualStyle} />
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
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <Analytics config={readAnalyticsConfig(settings)} />
      <Toaster position="top-center" richColors />
    </TenantProviders>
  );
}

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
import { CookieNotice } from '@/modules/Consent/presentation/CookieNotice';
import { COOKIE_POLICY_SLUG } from '@/modules/Consent/domain/Consent';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { readAnalyticsConfig } from '@/modules/Analytics/domain/Analytics';
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
  //
  // Aquí se fija solo la base; el canónico concreto lo declara cada página con `canonical()`
  // de `@/shared/lib/seo`. Ponerlo en este layout lo heredarían TODAS las rutas, y cada post
  // y cada producto terminaría señalando a la portada como su versión buena.
  const canonicalHost = settings.primaryDomain ?? tenantDomain;

  return {
    metadataBase: new URL(`https://${canonicalHost}`),
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
  const [settings, links, store, publishedPages] = await Promise.all([
    createGlobalSettingsService(tenantDomain).getSettings(),
    createNavigationService(tenantDomain).getLinks(),
    createStoreService(tenantDomain).getStoreSettings(),
    createPageService(tenantDomain).getPublishedPages(),
  ]);
  // Solo se enlaza si existe: mandar a un 404 desde un aviso legal es peor que no enlazar.
  const cookiePolicyHref = publishedPages.some((page) => page.slug === COOKIE_POLICY_SLUG)
    ? `/${COOKIE_POLICY_SLUG}`
    : null;
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
      <CookieNotice policyHref={cookiePolicyHref} />
      <Toaster position="top-center" richColors />
    </TenantProviders>
  );
}

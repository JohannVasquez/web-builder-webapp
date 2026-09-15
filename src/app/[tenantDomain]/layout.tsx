import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';
import { Navbar } from '@/modules/GlobalSettings/presentation/Navbar';
import { Footer } from '@/modules/GlobalSettings/presentation/Footer';
import { WhatsAppButton } from '@/modules/GlobalSettings/presentation/WhatsAppButton';
import { BrandStyle } from '@/modules/Brand/presentation/BrandStyle';
import { ThemeScript } from '@/modules/Brand/presentation/ThemeScript';
import { resolveFontPairing } from '@/modules/Brand/presentation/fonts';
import { VisualStyleTokens } from '@/modules/VisualStyle/presentation/VisualStyleTokens';
import { Toaster } from '@/shared/ui/sonner';

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

  return {
    // Sin base absoluta, Next no puede construir la URL de og:image ni la canónica.
    metadataBase: new URL(`https://${tenantDomain}`),
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: settings.tagline,
    icons: favicon === undefined ? undefined : { icon: favicon },
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: settings.siteName,
      description: settings.tagline,
      images: ogImage === undefined ? undefined : [{ url: ogImage }],
    },
    twitter: {
      card: ogImage === undefined ? 'summary' : 'summary_large_image',
      title: settings.siteName,
      description: settings.tagline,
      images: ogImage === undefined ? undefined : [ogImage],
    },
  };
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps): Promise<ReactElement> {
  const { tenantDomain } = await params;
  const [settings, links] = await Promise.all([
    createGlobalSettingsService(tenantDomain).getSettings(),
    createNavigationService(tenantDomain).getLinks(),
  ]);
  const pairing = resolveFontPairing(settings.brand.typography.pairing);

  return (
    <>
      <ThemeScript colorMode={settings.brand.colorMode} />
      <BrandStyle
        brand={settings.brand}
        headingVariable={pairing.headingVariableName}
        bodyVariable={pairing.bodyVariableName}
      />
      <VisualStyleTokens styleId={settings.brand.visualStyle} />
      <Navbar settings={settings} links={links} />
      <main className="ui-page-backdrop flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <Toaster position="top-center" richColors />
    </>
  );
}

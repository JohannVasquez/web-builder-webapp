import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';
import { Navbar } from '@/modules/GlobalSettings/presentation/Navbar';
import { Footer } from '@/modules/GlobalSettings/presentation/Footer';
import { WhatsAppButton } from '@/modules/GlobalSettings/presentation/WhatsAppButton';
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
  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.tagline,
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

  return (
    <>
      <Navbar settings={settings} links={links} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <Toaster position="top-center" richColors />
    </>
  );
}

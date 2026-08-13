import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';
import { Navbar } from '@/modules/GlobalSettings/presentation/Navbar';
import { Footer } from '@/modules/GlobalSettings/presentation/Footer';
import { WhatsAppButton } from '@/modules/GlobalSettings/presentation/WhatsAppButton';
import { Toaster } from '@/shared/ui/sonner';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await createGlobalSettingsService().getSettings();
  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.tagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const [settings, links] = await Promise.all([
    createGlobalSettingsService().getSettings(),
    createNavigationService().getLinks(),
  ]);

  return (
    <html lang="es" className="scroll-smooth">
      <body className="flex min-h-dvh flex-col antialiased">
        <Navbar settings={settings} links={links} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

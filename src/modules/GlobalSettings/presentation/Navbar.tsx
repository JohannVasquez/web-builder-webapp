import Link from 'next/link';
import type { ReactElement } from 'react';
import type { NavigationLink } from '@/modules/Navigation/domain/NavigationLink';
import { ThemeToggle } from '@/modules/Brand/presentation/ThemeToggle';
import type { GlobalSettings } from '../domain/GlobalSettings';

interface NavbarProps {
  readonly settings: GlobalSettings;
  readonly links: readonly NavigationLink[];
}

export function Navbar({ settings, links }: NavbarProps): ReactElement {
  const { logoLight, logoDark } = settings.brand.assets;

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {logoLight !== undefined ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
              <img
                src={logoLight}
                alt={settings.siteName}
                className={
                  logoDark !== undefined ? 'h-8 w-auto dark:hidden' : 'h-8 w-auto'
                }
              />
              {logoDark !== undefined && (
                // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                <img
                  src={logoDark}
                  alt={settings.siteName}
                  className="hidden h-8 w-auto dark:block"
                />
              )}
            </>
          ) : (
            settings.siteName
          )}
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-2 py-2 text-sm font-medium transition-colors md:px-3"
            >
              {link.label}
            </Link>
          ))}
          {settings.brand.colorMode === 'system' && <ThemeToggle />}
        </nav>
      </div>
    </header>
  );
}

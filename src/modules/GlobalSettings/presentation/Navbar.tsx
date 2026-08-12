import Link from 'next/link';
import type { ReactElement } from 'react';
import { NAVIGATION_LINKS } from '@/shared/config/navigation';
import type { GlobalSettings } from '../domain/GlobalSettings';

interface NavbarProps {
  readonly settings: GlobalSettings;
}

export function Navbar({ settings }: NavbarProps): ReactElement {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {settings.siteName}
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-2 py-2 text-sm font-medium transition-colors md:px-3"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

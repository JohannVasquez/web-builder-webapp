'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { NavigationLink } from '@/modules/Navigation/domain/NavigationLink';
import { ThemeToggle } from '@/modules/Brand/presentation/ThemeToggle';
import { CartIndicator } from '@/modules/Store/presentation/CartIndicator';
import { cn } from '@/shared/lib/utils';
import type { GlobalSettings } from '../domain/GlobalSettings';

const NAVBAR_VARIANTS = ['classic', 'centered', 'transparent'] as const;
type NavbarVariant = (typeof NAVBAR_VARIANTS)[number];

interface NavbarProps {
  readonly settings: GlobalSettings;
  readonly links: readonly NavigationLink[];
  // `classic` (default): logo a la izquierda, enlaces a la derecha. `centered`: logo al medio en escritorio (celular vuelve a `classic`). `transparent`: sin fondo hasta hacer scroll, para ir sobre una portada.
  readonly variant?: NavbarVariant;
  // El indicador del carrito solo tiene sentido si el cliente tiene tienda encendida.
  readonly showCart?: boolean;
}

function NavLink({ link }: { readonly link: NavigationLink }): ReactElement {
  return (
    <Link
      href={link.href}
      className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-2 py-2 text-sm font-medium transition-colors md:px-3"
    >
      {link.label}
    </Link>
  );
}

function Logo({
  settings,
  className,
}: {
  readonly settings: GlobalSettings;
  readonly className?: string;
}): ReactElement {
  const { logoLight, logoDark } = settings.brand.assets;
  return (
    <Link href="/" className={cn('text-lg font-bold tracking-tight', className)}>
      {logoLight !== undefined ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
          <img
            src={logoLight}
            alt={settings.siteName}
            className={logoDark !== undefined ? 'h-8 w-auto dark:hidden' : 'h-8 w-auto'}
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
  );
}

export function Navbar({
  settings,
  links,
  variant = 'classic',
  showCart = false,
}: NavbarProps): ReactElement {
  const resolvedVariant: NavbarVariant = NAVBAR_VARIANTS.includes(variant)
    ? variant
    : 'classic';
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const isTransparent = resolvedVariant === 'transparent';

  useEffect(() => {
    const node = sentinelRef.current;
    if (!isTransparent || node === null || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(entry?.isIntersecting === false);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isTransparent]);

  if (resolvedVariant === 'centered') {
    const half = Math.ceil(links.length / 2);
    const leftLinks = links.slice(0, half);
    const rightLinks = links.slice(half);

    return (
      <header className="ui-nav sticky top-0 z-50" data-variant={resolvedVariant}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:justify-center md:gap-6">
          <Logo settings={settings} className="md:hidden" />
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-1">
            {leftLinks.map((link) => (
              <NavLink key={link.href} link={link} />
            ))}
          </div>
          <Logo settings={settings} className="hidden shrink-0 md:block" />
          <nav className="flex items-center gap-1 md:hidden">
            {links.map((link) => (
              <NavLink key={link.href} link={link} />
            ))}
            {showCart && <CartIndicator />}
            {settings.brand.colorMode === 'system' && <ThemeToggle />}
          </nav>
          <div className="hidden md:flex md:flex-1 md:items-center md:gap-1">
            {rightLinks.map((link) => (
              <NavLink key={link.href} link={link} />
            ))}
            {showCart && <CartIndicator />}
            {settings.brand.colorMode === 'system' && <ThemeToggle />}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors',
        (!isTransparent || scrolled) && 'ui-nav',
      )}
      data-variant={resolvedVariant}
    >
      {isTransparent && (
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      )}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo settings={settings} />
        <nav className="flex items-center gap-1 md:gap-2">
          {links.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
          {showCart && <CartIndicator />}
          {settings.brand.colorMode === 'system' && <ThemeToggle />}
        </nav>
      </div>
    </header>
  );
}

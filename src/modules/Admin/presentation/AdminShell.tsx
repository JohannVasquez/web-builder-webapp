'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { Activity, KeyRound, LogOut, Users } from 'lucide-react';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { LoginForm } from './LoginForm';

const LINKS = [
  { href: '/', label: 'Clientes', Icon: Users },
  { href: '/claves', label: 'Claves de acceso', Icon: KeyRound },
  { href: '/actividad', label: 'Actividad', Icon: Activity },
];

interface AdminShellProps {
  readonly children: ReactNode;
}

// Guarda de sesión y chrome del panel en un solo lugar: ninguna pantalla tiene que
// acordarse de comprobar si hay sesión.
export function AdminShell({ children }: AdminShellProps): ReactElement {
  const { session, isLoading, signOut } = useSession();
  const pathname = usePathname();

  // La pestaña del panel no debería quedarse con el título del último sitio visitado.
  useEffect(() => {
    document.title = 'Panel — Web Builder';
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true" />
    );
  }

  if (session === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 py-16">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="ui-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="ui-heading text-lg">
            Web Builder
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  pathname === href
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm md:inline">
              {session.user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}

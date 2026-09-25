'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { Activity, Banknote, KeyRound, LogOut, ShieldAlert, Users } from 'lucide-react';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { visibleNavLinks, isOwnerOnlyPath } from '../application/navLinks';
import { canManageUsers } from '../application/userPresentation';
import { LoginForm } from './LoginForm';

const ICON_BY_HREF: Record<string, typeof Users> = {
  '/': Users,
  '/claves': KeyRound,
  '/usuarios': Users,
  '/cobros': Banknote,
  '/actividad': Activity,
};

// Rutas de autenticación que deben verse sin sesión y sin el chrome del panel: el enlace de
// recuperación llega desde un correo, así que nunca hay sesión activa al abrirlo.
const PUBLIC_AUTH_PATHS = ['/reset-password'];

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

  if (pathname !== null && PUBLIC_AUTH_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

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

  const role = session.user.role;
  const links = visibleNavLinks(role);
  const isForbidden =
    pathname !== null && isOwnerOnlyPath(pathname) && !canManageUsers(role);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="ui-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="ui-heading text-lg">
            Web Builder
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map(({ href, label }) => {
              const Icon = ICON_BY_HREF[href] ?? Users;
              return (
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
              );
            })}
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
        {isForbidden ? <OwnerOnlyNotice /> : children}
      </main>
    </div>
  );
}

function OwnerOnlyNotice(): ReactElement {
  return (
    <div role="alert" className="ui-card flex items-start gap-3 p-6">
      <ShieldAlert className="text-muted-foreground mt-0.5 size-5 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">Esta sección es solo para la dueña de la cuenta.</p>
        <p className="text-muted-foreground text-sm">
          Si necesitas entrar aquí, pídele a la dueña de la cuenta que te dé ese permiso.
        </p>
      </div>
    </div>
  );
}

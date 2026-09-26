import Link from 'next/link';
import type { ReactElement } from 'react';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import { DEMO_METRICS_PATH } from '../application/navLinks';
import { cn } from '@/shared/lib/utils';

const TABS = [
  { href: '/demos', label: 'Demos' },
  { href: DEMO_METRICS_PATH, label: 'Métricas' },
] as const;

// Las pestañas solo existen para la dueña: una editora no tiene a dónde más ir dentro de
// Demos, y mostrarle "Métricas" sería ofrecerle una puerta cerrada.
export function DemoSectionTabs({
  role,
  current,
}: {
  readonly role: AdminRole;
  readonly current: (typeof TABS)[number]['href'];
}): ReactElement | null {
  if (role !== 'owner') {
    return null;
  }
  return (
    <nav aria-label="Vistas de demos" className="flex gap-1 border-b">
      {TABS.map((tab) => {
        const isCurrent = tab.href === current;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isCurrent
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

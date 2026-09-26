import type { ReactElement } from 'react';
import { AlarmClock, Ban, CircleCheck, Handshake, Hourglass, Trash2 } from 'lucide-react';
import {
  DEMO_STATUS_LABELS,
  type DemoDisplayStatus,
} from '../application/demoPresentation';

const STATUS_ICONS: Record<DemoDisplayStatus, typeof CircleCheck> = {
  vigente: CircleCheck,
  'por-vencer': AlarmClock,
  vencida: Hourglass,
  convertida: Handshake,
  descartada: Ban,
  borrada: Trash2,
};

const STATUS_CLASSES: Record<DemoDisplayStatus, string> = {
  vigente: 'text-emerald-700 dark:text-emerald-400',
  'por-vencer': 'text-amber-700 dark:text-amber-400',
  vencida: 'text-red-700 dark:text-red-400',
  convertida: 'text-sky-700 dark:text-sky-400',
  descartada: 'text-muted-foreground',
  borrada: 'text-muted-foreground',
};

// Ícono y texto, igual que en Cobros: el estado se entiende sin distinguir colores y el lector
// de pantalla lo anuncia como "Estado: Por vencer".
export function DemoStatusBadge({
  status,
}: {
  readonly status: DemoDisplayStatus;
}): ReactElement {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-medium ${STATUS_CLASSES[status]}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Estado: </span>
      {DEMO_STATUS_LABELS[status]}
    </span>
  );
}

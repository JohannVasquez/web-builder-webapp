'use client';

import Link from 'next/link';
import { useSyncExternalStore, type CSSProperties, type ReactElement } from 'react';
import { z } from 'zod';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import { SectionLayoutPropsSchema } from '@/shared/lib/sectionLayout';
import type { SectionComponentProps } from '../SectionComponentProps';

const ANNOUNCEMENT_BAR_VARIANTS = ['top', 'inline'] as const;

const AnnouncementBarPropsSchema = z.object({
  message: z.string().default(''),
  linkLabel: z.string().optional(),
  linkHref: z.string().optional(),
  dismissible: z.boolean().default(true),
  // Distingue este aviso de otro en localStorage; sin él se usa un hash del mensaje.
  id: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  // `top` (default): franja fija arriba de todo. `inline`: píldora dentro del flujo de la página.
  variant: z.enum(ANNOUNCEMENT_BAR_VARIANTS).default('top').catch('top'),
});

const STORAGE_PREFIX = 'announcement-dismissed:';

// Hash simple y estable (djb2-like): solo necesita distinguir mensajes, no ser criptográfico.
function hashOf(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function storageKeyFor(id: string | undefined, message: string): string {
  return `${STORAGE_PREFIX}${id ?? hashOf(message)}`;
}

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isDismissedOnServer(): boolean {
  return false;
}

export function AnnouncementBar({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = AnnouncementBarPropsSchema.safeParse(sectionProps);
  const key = parsed.success ? storageKeyFor(parsed.data.id, parsed.data.message) : '';

  const isDismissed = (): boolean => {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  };

  const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer);

  if (!parsed.success) {
    return null;
  }
  const { message, linkLabel, linkHref, dismissible, variant, accentColor } = parsed.data;
  if (message === '' || dismissed) {
    return null;
  }

  const dismiss = (): void => {
    try {
      localStorage.setItem(key, '1');
    } catch {
      // Sin almacenamiento (ej. modo privado) el cierre solo dura esta pestaña.
    }
    notify();
  };

  const style: CSSProperties =
    parsed.data.backgroundColor !== undefined
      ? (sectionBackgroundStyle(parsed.data) ?? {})
      : {
          backgroundColor: accentColor ?? 'var(--brand-accent)',
          color: 'var(--brand-accent-foreground)',
        };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-sm',
        variant === 'top'
          ? 'sticky top-0 z-40 w-full'
          : 'ui-card mx-auto w-fit rounded-full px-5 py-2',
      )}
      style={style}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <p className="font-medium">
        {message}
        {linkLabel !== undefined && linkHref !== undefined && (
          <Link href={linkHref} className="ml-2 underline underline-offset-2">
            {linkLabel}
          </Link>
        )}
      </p>
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="focus-visible:ring-white/60 inline-flex size-6 shrink-0 items-center justify-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

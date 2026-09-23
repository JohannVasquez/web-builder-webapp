'use client';

import { useState, type ReactElement } from 'react';
import { ArrowRight, Check, Clock, Copy, Mail, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { cn } from '@/shared/lib/utils';
import type { ContactChannel } from '../domain/ContactChannelSchema';

interface ContactChannelsProps {
  readonly items: readonly ContactChannel[];
  readonly accentColor?: string;
}

const DEFAULT_ACCENT = 'var(--brand-accent)';
// Verde oficial de la marca WhatsApp, no del cliente: no sale de los tokens.
const WHATSAPP_COLOR = '#25D366';

function IconBadge({
  children,
  color,
}: {
  readonly children: ReactElement;
  readonly color: string;
}): ReactElement {
  return (
    <div
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}

function CopyButton({ value }: { readonly value: string }): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Portapapeles no disponible (ej. contexto no seguro): sin feedback,
      // el email sigue siendo seleccionable a mano.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label="Copiar"
      className="hover:bg-accent flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

function ChannelValue({
  channel,
  accentColor,
}: {
  readonly channel: ContactChannel;
  readonly accentColor: string;
}): ReactElement | null {
  switch (channel.type) {
    case 'phone':
      return channel.value !== undefined ? (
        <a
          href={`tel:${channel.value.replace(/\s+/g, '')}`}
          className="text-lg font-bold hover:underline"
          style={{ color: accentColor }}
        >
          {channel.value}
        </a>
      ) : null;
    case 'whatsapp':
      return channel.value !== undefined ? (
        <a
          href={`https://wa.me/${channel.value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          style={{ color: WHATSAPP_COLOR }}
        >
          {channel.linkLabel ?? 'Iniciar chat'}
          <ArrowRight className="size-4" />
        </a>
      ) : null;
    case 'email':
      return channel.value !== undefined ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{channel.value}</span>
          <CopyButton value={channel.value} />
        </div>
      ) : null;
    case 'hours':
      if (channel.schedule.length > 0) {
        return (
          <dl className="space-y-1 text-sm">
            {channel.schedule.map((row) => (
              <div key={row.day} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{row.day}</dt>
                <dd className="font-medium">{row.hours}</dd>
              </div>
            ))}
          </dl>
        );
      }
      return channel.alwaysOpenLabel !== undefined ? (
        <p className="text-sm font-medium">{channel.alwaysOpenLabel}</p>
      ) : null;
    case 'text':
      return channel.value !== undefined ? (
        <p className="text-sm font-medium">{channel.value}</p>
      ) : null;
    default:
      return null;
  }
}

const ICON_BY_TYPE: Readonly<Record<ContactChannel['type'], ReactElement>> = {
  phone: <Phone className="size-5" />,
  whatsapp: <FaWhatsapp className="size-5" />,
  email: <Mail className="size-5" />,
  hours: <Clock className="size-5" />,
  text: <Phone className="size-5" />,
};

/**
 * Panel de canales de contacto (llamar, WhatsApp, email copiable, horario de
 * atención). Cada tenant decide qué canales mostrar y en qué orden desde
 * `ContactForm.props.channels` — sin este prop, `ContactFormSection` sigue
 * mostrando solo el formulario, igual que antes.
 */
export function ContactChannels({
  items,
  accentColor,
}: ContactChannelsProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }
  const accent = accentColor ?? DEFAULT_ACCENT;

  return (
    <div className="space-y-4">
      {items.map((channel) => (
        <div key={channel.title} className={cn('ui-card flex gap-4 p-5')}>
          <IconBadge color={channel.type === 'whatsapp' ? WHATSAPP_COLOR : accent}>
            {ICON_BY_TYPE[channel.type]}
          </IconBadge>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{channel.title}</h3>
            {channel.description !== undefined && (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {channel.description}
              </p>
            )}
            <div className="mt-2">
              <ChannelValue channel={channel} accentColor={accent} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

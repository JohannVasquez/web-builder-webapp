'use client';

import { useId, useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Check, Copy, ExternalLink, MessageCircle, TriangleAlert, X } from 'lucide-react';
import type { DemoLink } from '../domain/DemoApi';
import {
  defaultProspectMessage,
  hasPhoneDigits,
  whatsappUrl,
} from '../application/demoPresentation';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

export const LINKS_SHOWN_ONCE_WARNING =
  'Guarda o envía el enlace ahora; no se vuelve a mostrar. Si lo pierdes, genera uno nuevo.';

export interface DemoLinksRevealProps {
  readonly title: string;
  readonly prospectLink: DemoLink | null;
  readonly teamLink: DemoLink | null;
  readonly businessName: string;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly onDismiss: () => void;
}

// Los enlaces llegan en claro una sola vez (la API guarda solo su huella), así que este panel
// no se cierra solo: queda hasta que la persona lo descarte.
export function DemoLinksReveal({
  title,
  prospectLink,
  teamLink,
  businessName,
  contactName,
  phone,
  onDismiss,
}: DemoLinksRevealProps): ReactElement {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="ui-card space-y-4 border-2 border-amber-400 bg-amber-50 p-4 sm:p-5 dark:border-amber-500 dark:bg-amber-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={headingId} className="ui-heading text-lg">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cerrar los enlaces"
          onClick={() => {
            if (
              window.confirm(
                'Después de cerrar no podrás volver a ver estos enlaces. ¿Ya los guardaste o enviaste?',
              )
            ) {
              onDismiss();
            }
          }}
        >
          <X className="size-4" />
        </Button>
      </div>

      <p
        role="alert"
        className="flex items-start gap-2 text-sm font-medium text-amber-900 dark:text-amber-200"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {LINKS_SHOWN_ONCE_WARNING}
      </p>

      {prospectLink !== null && (
        <ProspectLinkBlock
          link={prospectLink}
          businessName={businessName}
          contactName={contactName}
          phone={phone}
        />
      )}

      {teamLink !== null && <TeamLinkBlock link={teamLink} />}
    </section>
  );
}

function ProspectLinkBlock({
  link,
  businessName,
  contactName,
  phone,
}: {
  readonly link: DemoLink;
  readonly businessName: string;
  readonly contactName: string | null;
  readonly phone: string | null;
}): ReactElement {
  const messageId = useId();
  const [message, setMessage] = useState(() =>
    defaultProspectMessage({ contactName, businessName, url: link.url }),
  );

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Enlace del prospecto</h3>
      <LinkValue url={link.url} label="Copiar enlace del prospecto" />
      <div className="space-y-2">
        <Label htmlFor={messageId}>Mensaje para WhatsApp</Label>
        <Textarea
          id={messageId}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
        />
        {!message.includes(link.url) && (
          <p className="text-sm text-amber-900 dark:text-amber-200">
            El mensaje ya no incluye el enlace: el prospecto no podrá abrir su demo.
          </p>
        )}
      </div>
      <Button asChild className="w-full sm:w-auto">
        <a href={whatsappUrl(phone, message)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" /> Enviar por WhatsApp
        </a>
      </Button>
      {!hasPhoneDigits(phone) && (
        <p className="text-muted-foreground text-sm">
          El prospecto no tiene teléfono: WhatsApp te pedirá elegir el contacto.
        </p>
      )}
    </div>
  );
}

function TeamLinkBlock({ link }: { readonly link: DemoLink }): ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Enlace de equipo</h3>
      <p className="text-muted-foreground text-sm">
        Para ti y el equipo: no cuenta visitas y sigue abriendo aunque la demo venza. No
        lo mandes al prospecto.
      </p>
      <LinkValue url={link.url} label="Copiar enlace de equipo" />
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-4" /> Ver como equipo
        </a>
      </Button>
    </div>
  );
}

function LinkValue({
  url,
  label,
}: {
  readonly url: string;
  readonly label: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Enlace copiado.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No pudimos copiar el enlace. Selecciónalo y cópialo a mano.');
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="ui-input min-w-0 flex-1 px-3 py-2 font-mono text-xs break-all select-all">
        {url}
      </code>
      <Button type="button" variant="outline" onClick={() => void handleCopy()}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {label}
      </Button>
    </div>
  );
}

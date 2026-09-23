'use client';

import type { ReactElement } from 'react';
import { toast } from 'sonner';
import { Link as LinkIcon } from 'lucide-react';
import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { buildShareLinks } from './shareLinks';

interface ShareButtonsProps {
  readonly url: string;
  readonly title: string;
}

const ICON_BUTTON =
  'ui-button bg-secondary text-secondary-foreground inline-flex size-9 items-center justify-center rounded-full';

export function ShareButtons({ url, title }: ShareButtonsProps): ReactElement {
  const links = buildShareLinks(url, title);

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Compartir:</span>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className={ICON_BUTTON}
      >
        <FaWhatsapp className="size-4" />
      </a>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X"
        className={ICON_BUTTON}
      >
        <FaXTwitter className="size-4" />
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
        className={ICON_BUTTON}
      >
        <FaLinkedinIn className="size-4" />
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        aria-label="Copiar enlace"
        className={ICON_BUTTON}
      >
        <LinkIcon className="size-4" />
      </button>
    </div>
  );
}

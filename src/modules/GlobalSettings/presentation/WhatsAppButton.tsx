import type { ReactElement } from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  readonly whatsappNumber: string;
}

/**
 * Botón flotante que enlaza a WhatsApp usando exclusivamente el número
 * provisto por GlobalSettings (AC2.3). No se renderiza si no hay número.
 */
export function WhatsAppButton({
  whatsappNumber,
}: WhatsAppButtonProps): ReactElement | null {
  if (whatsappNumber === '') {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}

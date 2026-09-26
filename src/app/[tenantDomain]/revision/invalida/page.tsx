import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { Button } from '@/shared/ui/button';

interface InvalidPreviewPageProps {
  readonly searchParams: Promise<{ reason?: string }>;
}

export const metadata: Metadata = {
  title: 'Enlace de revisión inválido',
  robots: { index: false, follow: false },
};

export default async function InvalidPreviewPage({
  searchParams,
}: InvalidPreviewPageProps): Promise<ReactElement> {
  const { reason } = await searchParams;

  let message = 'El enlace de revisión no es válido o está incompleto.';
  if (reason === 'preview_link_expired') {
    message = 'El enlace de revisión ha caducado. Pídele a tu agencia que te genere uno nuevo.';
  } else if (reason === 'preview_link_revoked') {
    message = 'El enlace de revisión fue anulado por tu agencia.';
  } else if (reason === 'preview_link_not_found') {
    message = 'El enlace de revisión no existe.';
  } else if (reason === 'preview_link_tenant_mismatch') {
    message = 'El enlace de revisión no corresponde a este sitio web.';
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="ui-heading text-3xl md:text-4xl">No pudimos abrir la vista previa</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild variant="outline">
        <Link href="/">Ir al sitio publicado</Link>
      </Button>
    </div>
  );
}

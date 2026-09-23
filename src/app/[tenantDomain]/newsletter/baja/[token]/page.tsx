import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { getApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';

interface UnsubscribePageProps {
  readonly params: Promise<{ token: string }>;
}

// Una página de baja no tiene nada que hacer en un buscador.
export const metadata: Metadata = {
  title: 'Baja de novedades',
  robots: { index: false, follow: false },
};

/**
 * La baja ocurre al abrir la página, no con un botón. El art. 28 B de la Ley 19.496 pide que
 * sea expedita: pedir un clic más para confirmar algo que la persona ya pidió al pinchar el
 * enlace del correo es un obstáculo, no una confirmación.
 *
 * Los prefetchers de correo que abren enlaces solos dan de baja a quien no quería: por eso
 * también sirve `POST`, y quien vuelve a suscribirse tiene el formulario de siempre.
 */
const unsubscribe = async (token: string): Promise<boolean> => {
  try {
    // Sin cabecera de tenant: el endpoint vive fuera del resolutor porque el token es único
    // en toda la plataforma y el enlace puede abrirse desde cualquier dominio.
    const response = await fetch(`${getApiBaseUrl()}/api/newsletter-baja/${token}`, {
      method: 'POST',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default async function UnsubscribePage({
  params,
}: UnsubscribePageProps): Promise<ReactElement> {
  const { token } = await params;
  const done = await unsubscribe(token);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="ui-heading text-3xl md:text-4xl">
        {done ? 'Listo, te diste de baja' : 'No pudimos procesar tu baja'}
      </h1>
      <p className="text-muted-foreground">
        {done
          ? 'No volverás a recibir nuestros correos de novedades. Si fue sin querer, puedes volver a suscribirte cuando quieras.'
          : 'El enlace puede haber caducado o estar incompleto. Escríbenos y te damos de baja a mano.'}
      </p>
      <Button asChild variant="outline">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}

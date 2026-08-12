import Link from 'next/link';
import type { ReactElement } from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export default function NotFound(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <div className="bg-secondary text-muted-foreground flex size-20 items-center justify-center rounded-full">
        <Compass className="size-10" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-md">
        La página que buscas no existe o fue movida. Revisa la dirección o vuelve al
        inicio.
      </p>
      <Button asChild size="lg">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}

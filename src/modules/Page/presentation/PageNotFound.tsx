import Link from 'next/link';
import type { ReactElement } from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { NavigationLink } from '@/modules/Navigation/domain/NavigationLink';

// Vista de 404 compartida por el not-found raíz y el del tenant. El del
// tenant se renderiza dentro de su layout, así que conserva navbar y footer
// con la marca correcta.
export function PageNotFound({
  links = [],
}: {
  readonly links?: readonly NavigationLink[];
}): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center md:py-32">
      <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-full">
        <Compass className="size-10" />
      </div>
      <h1 className="ui-heading text-4xl md:text-5xl">No encontramos esta página</h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Puede que la dirección tenga un error o que la página se haya movido. Vuelve al
        inicio o sigue por alguna de estas secciones.
      </p>

      <div className="mt-4">
        <Button asChild size="lg">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>

      {links.length > 0 && (
        <div className="ui-card mt-8 w-full max-w-md p-6">
          <h2 className="ui-heading mb-4 text-xl">Quizás te interese:</h2>
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground hover:text-primary focus-visible:ring-ring flex items-center justify-center rounded-md px-4 py-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

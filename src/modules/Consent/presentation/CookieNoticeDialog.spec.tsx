import { renderToStaticMarkup } from 'react-dom/server';
import { CookieNoticeDialog } from './CookieNoticeDialog';
import type { ConsentPurpose } from '../domain/Consent';

const render = (
  overrides: {
    current?: readonly ConsentPurpose[];
    policyHref?: string | null;
    canDismiss?: boolean;
  } = {},
): string =>
  renderToStaticMarkup(
    <CookieNoticeDialog
      current={overrides.current ?? []}
      policyHref={overrides.policyHref ?? null}
      canDismiss={overrides.canDismiss ?? false}
      onDecide={() => undefined}
      onClose={() => undefined}
    />,
  );

describe('CookieNoticeDialog', () => {
  it('rechazar pesa lo mismo que aceptar', () => {
    const html = render();

    expect(html).toContain('Aceptar todo');
    expect(html).toContain('Rechazar todo');
    // Un "rechazar" en variante apagada al lado de un "aceptar" destacado es el patrón que
    // la norma trata como consentimiento viciado.
    const aceptar = /<button[^>]*>Aceptar todo<\/button>/.exec(html)?.[0] ?? '';
    const rechazar = /<button[^>]*>Rechazar todo<\/button>/.exec(html)?.[0] ?? '';
    expect(rechazar.replace('Rechazar', 'Aceptar')).toBe(aceptar);
  });

  it('ofrece elegir finalidad por finalidad', () => {
    expect(render()).toContain('Elegir finalidades');
  });

  it('es un diálogo con nombre accesible y enfocable', () => {
    const html = render();

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-labelledby="aviso-cookies-titulo"');
    expect(html).toContain('tabindex="-1"');
  });

  it('enlaza la política de cookies cuando el cliente tiene una publicada', () => {
    expect(render({ policyHref: '/politica-de-cookies' })).toContain(
      'href="/politica-de-cookies"',
    );
  });

  it('sin política publicada no enlaza a un 404', () => {
    expect(render()).not.toContain('politica-de-cookies');
  });

  it('sin decisión previa no se puede cerrar sin decidir', () => {
    expect(render({ canDismiss: false })).not.toContain('Cerrar');
  });

  it('reabierto desde el pie sí se puede cerrar', () => {
    expect(render({ canDismiss: true })).toContain('Cerrar');
  });
});

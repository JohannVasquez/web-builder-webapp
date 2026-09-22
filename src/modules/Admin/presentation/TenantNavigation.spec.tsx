import { renderToStaticMarkup } from 'react-dom/server';
import { NavigationLinkList } from './TenantNavigation';
import type { AdminPage } from '../domain/AdminApi';
import type { NavLinkDraft } from '../application/navigationForm';

const links: NavLinkDraft[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
];

const page: AdminPage = {
  id: 1,
  slug: 'servicios',
  title: 'Servicios',
  description: null,
  isPublished: true,
  visualStyle: null,
  sections: [],
};

const noop = (): void => {
  // No hace nada: la prueba solo mira el marcado, no las llamadas a estos callbacks.
};

const baseProps = {
  pages: [page],
  isBusy: false,
  dragOverIndex: null,
  onLabelChange: noop,
  onHrefChange: noop,
  onSelectPage: noop,
  onMoveUp: noop,
  onMoveDown: noop,
  onRemove: noop,
  onDragStart: noop,
  onDragOver: noop,
  onDrop: noop,
  onDragEnd: noop,
};

describe('NavigationLinkList', () => {
  it('sin enlaces muestra el mensaje de lista vacía', () => {
    const html = renderToStaticMarkup(
      <NavigationLinkList {...baseProps} links={[]} errors={[]} />,
    );
    expect(html).toContain('Este menú todavía no tiene enlaces.');
  });

  it('muestra el texto y el enlace de cada fila, y la opción de elegir una página', () => {
    const html = renderToStaticMarkup(
      <NavigationLinkList
        {...baseProps}
        links={links}
        errors={[
          { label: null, href: null },
          { label: null, href: null },
        ]}
      />,
    );
    expect(html).toContain('Inicio');
    expect(html).toContain('Servicios');
    expect(html).toContain('O elige una página existente');
  });

  it('muestra el error de un enlace inválido', () => {
    const html = renderToStaticMarkup(
      <NavigationLinkList
        {...baseProps}
        links={links}
        errors={[
          {
            label: null,
            href: 'Usa una dirección de tu sitio (empieza con /) o una URL completa',
          },
          { label: null, href: null },
        ]}
      />,
    );
    expect(html).toContain('Usa una dirección de tu sitio');
  });

  it('el primer enlace no puede subir y el último no puede bajar', () => {
    const html = renderToStaticMarkup(
      <NavigationLinkList
        {...baseProps}
        links={links}
        errors={[
          { label: null, href: null },
          { label: null, href: null },
        ]}
      />,
    );
    const upDisabled = html.match(/aria-label="Subir enlace"[^>]*disabled/g) ?? [];
    const downDisabled = html.match(/aria-label="Bajar enlace"[^>]*disabled/g) ?? [];
    expect(upDisabled.length).toBe(1);
    expect(downDisabled.length).toBe(1);
  });

  it('sin páginas del cliente no ofrece el selector', () => {
    const html = renderToStaticMarkup(
      <NavigationLinkList
        {...baseProps}
        pages={[]}
        links={links}
        errors={[
          { label: null, href: null },
          { label: null, href: null },
        ]}
      />,
    );
    expect(html).not.toContain('O elige una página existente');
  });
});

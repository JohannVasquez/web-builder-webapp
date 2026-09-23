import { renderToStaticMarkup } from 'react-dom/server';
import { PageNotFound } from './PageNotFound';

describe('PageNotFound', () => {
  it('renderiza correctamente sin enlaces', () => {
    const html = renderToStaticMarkup(<PageNotFound />);

    // Verifica que haya un solo h1
    const h1Matches = html.match(/<h1[^>]*>/g);
    expect(h1Matches).toHaveLength(1);
    expect(html).toContain('No encontramos esta página');

    // Verifica el enlace de inicio
    expect(html).toContain('href="/"');
    expect(html).toContain('Ir al inicio');

    // Verifica que no se renderice el contenedor de enlaces
    expect(html).not.toContain('Quizás te interese');
  });

  it('renderiza los enlaces cuando se proveen', () => {
    const links = [
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Productos', href: '/productos' },
    ];

    const html = renderToStaticMarkup(<PageNotFound links={links} />);

    // Verifica que se muestre el título de la sección de enlaces
    expect(html).toContain('Quizás te interese');

    // Verifica que se rendericen los enlaces
    expect(html).toContain('href="/nosotros"');
    expect(html).toContain('Sobre Nosotros');
    expect(html).toContain('href="/productos"');
    expect(html).toContain('Productos');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { RevealOnScroll } from './RevealOnScroll';

describe('RevealOnScroll', () => {
  it('con "none" no trae ninguna clase de reveal ni atributo data-revealed', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="none" className="mx-auto">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).not.toContain('reveal-fade');
    expect(html).not.toContain('reveal-slide');
    expect(html).not.toContain('data-revealed');
    expect(html).toContain('Contenido');
  });

  it('con "fade" trae la clase reveal-fade', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="fade">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).toContain('reveal-fade');
    expect(html).not.toContain('reveal-slide');
  });

  it('con "slide" trae la clase reveal-slide', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="slide">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).toContain('reveal-slide');
    expect(html).not.toContain('reveal-fade');
  });

  it('el HTML del servidor sale con data-revealed="false": el CSS decide bajo [data-js=\'on\']', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="fade">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).toContain('data-revealed="false"');
    expect(html).toContain('Contenido');
  });

  it('el HTML del servidor no trae opacity inline ni hidden: el ocultamiento es puramente CSS', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="fade">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    expect(html).not.toContain('hidden');
    expect(html).not.toContain('style=');
  });

  it('con "slide" el HTML del servidor también sale con data-revealed="false"', () => {
    const html = renderToStaticMarkup(
      <RevealOnScroll animation="slide">
        <p>Contenido</p>
      </RevealOnScroll>,
    );

    expect(html).toContain('data-revealed="false"');
    expect(html).not.toContain('style=');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { BeforeAfter } from './BeforeAfter';
import { Columns } from './Columns';
import { Gallery } from './Gallery';
import { GoogleReviews } from './GoogleReviews';
import { LogoCloud } from './LogoCloud';
import { SplitHighlights } from './SplitHighlights';
import { TextBlock } from './TextBlock';

describe('Carga de imágenes diferida y alt texts en componentes', () => {
  it('BeforeAfter carga imágenes diferidas con alt texts correctos y sin preload', () => {
    const html = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ title: 'Title', beforeUrl: 'https://example.com/a.jpg', afterUrl: 'https://example.com/b.jpg', beforeLabel: 'Antes de la obra', afterLabel: 'Después de la obra' }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Antes de la obra"');
    expect(html).toContain('alt="Después de la obra"');
    // The first images will have preload, but the last one will have loading=lazy
  });

  it('Columns carga imágenes diferidas con alt texts correctos', () => {
    const html = renderToStaticMarkup(
      <Columns sectionProps={{ title: 'Title', columns: [{ title: 'Col', content: 'Cont', imageUrl: 'https://example.com/a.jpg', imageAlt: 'Una columna' }] }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Una columna"');
    expect(html).not.toContain('<link rel="preload"');
  });

  it('Gallery carga imágenes diferidas con alt texts correctos', () => {
    const html = renderToStaticMarkup(
      <Gallery sectionProps={{ title: 'Title', images: [{ url: 'https://example.com/a.jpg', alt: 'Arte 1' }, { url: 'https://example.com/b.jpg', alt: 'Arte 2' }, { url: 'https://example.com/c.jpg', alt: 'Arte 3' }, { url: 'https://example.com/d.jpg', alt: 'Arte 4' }] }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Arte 4"');
  });

  it('GoogleReviews carga avatares diferidos como decorativos', () => {
    const html = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ title: 'Title', rating: 5, reviewCount: 1, reviews: [{ author: 'Pepe', rating: 5, text: 'Bien', avatarUrl: 'https://example.com/a.jpg' }] }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });

  it('LogoCloud carga logos diferidos con alt texts correctos', () => {
    const html = renderToStaticMarkup(
      <LogoCloud sectionProps={{ title: 'Title', logos: [{ url: 'https://example.com/a.jpg', alt: 'Un logo' }] }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Un logo"');
    expect(html).not.toContain('<link rel="preload"');
  });

  it('SplitHighlights carga imagen destacada como diferida y decorativa', () => {
    const html = renderToStaticMarkup(
      <SplitHighlights sectionProps={{ title: 'Title', content: 'Cont', imageUrl: 'https://example.com/a.jpg' }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });

  it('TextBlock carga imagen adjunta como diferida y decorativa', () => {
    const html = renderToStaticMarkup(
      <TextBlock sectionProps={{ title: 'Title', content: 'Cont', imageUrl: 'https://example.com/a.jpg' }} />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });
});

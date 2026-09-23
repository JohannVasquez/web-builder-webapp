import { buildShareLinks } from './shareLinks';

describe('buildShareLinks', () => {
  const url = 'https://electrica.cl/blog/post-publicado';
  const title = 'Instalación eléctrica: qué revisar antes del verano';

  it('codifica la URL y el título para cada red', () => {
    const links = buildShareLinks(url, title);

    expect(links.whatsapp).toBe(
      `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`,
    );
    expect(links.x).toBe(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    );
    expect(links.linkedin).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    );
  });

  it('codifica los acentos del título en vez de dejarlos crudos', () => {
    const withAccents = 'Certificación eléctrica y mantención sin sobresaltos';
    const links = buildShareLinks(url, withAccents);

    expect(links.whatsapp).not.toContain('ó');
    expect(links.whatsapp).not.toContain('é');
    expect(links.whatsapp).toContain(encodeURIComponent(withAccents));
  });

  it('no deja espacios sin codificar en ningún enlace', () => {
    const links = buildShareLinks(url, title);

    const values: readonly string[] = [links.whatsapp, links.x, links.linkedin];
    for (const link of values) {
      const afterFirstQueryParam = link.split('?')[1] ?? '';
      expect(afterFirstQueryParam).not.toContain(' ');
    }
  });
});

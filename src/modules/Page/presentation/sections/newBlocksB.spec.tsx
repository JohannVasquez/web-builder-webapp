import { renderToStaticMarkup } from 'react-dom/server';
import { Team } from './Team';
import { Timeline } from './Timeline';
import { VideoBlock } from './VideoBlock';
import { AnnouncementBar } from './AnnouncementBar';

describe('Team', () => {
  const members = [
    { name: 'Ana López', role: 'Directora', bio: 'Lidera el equipo.' },
    {
      name: 'Juan Pérez',
      role: 'Diseñador',
      photoUrl: 'https://bucket.example.com/juan.jpg',
      socials: [{ label: 'Instagram', url: 'https://instagram.com/juanperez' }],
    },
  ];

  it('sin members no renderiza nada', () => {
    const html = renderToStaticMarkup(<Team sectionProps={{ title: 'Equipo' }} />);
    expect(html).toBe('');
  });

  it('con members el contenido aparece', () => {
    const html = renderToStaticMarkup(
      <Team sectionProps={{ title: 'Equipo', members }} />,
    );
    expect(html).toContain('Equipo');
    expect(html).toContain('Ana López');
    expect(html).toContain('Directora');
    expect(html).toContain('Juan Pérez');
  });

  it('sin photoUrl muestra las iniciales', () => {
    const html = renderToStaticMarkup(<Team sectionProps={{ members }} />);
    expect(html).toContain('AL');
  });

  it('con photoUrl muestra un <img> con su alt', () => {
    const html = renderToStaticMarkup(<Team sectionProps={{ members }} />);
    expect(html).toContain('<img');
    expect(html).toMatch(/https%3A%2F%2Fbucket.example.com%2Fjuan.jpg/);
    expect(html).toContain('alt="Juan Pérez"');
  });

  it('los enlaces de redes llevan target, rel y aria-label', () => {
    const html = renderToStaticMarkup(<Team sectionProps={{ members }} />);
    expect(html).toContain('href="https://instagram.com/juanperez"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Instagram"');
  });

  it('sin variant, el HTML es idéntico al de "grid" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Team sectionProps={{ members }} />);
    const withGrid = renderToStaticMarkup(
      <Team sectionProps={{ members, variant: 'grid' }} />,
    );
    expect(withoutVariant).toBe(withGrid);
  });

  it('una variante desconocida cae a "grid"', () => {
    const unknown = renderToStaticMarkup(
      <Team sectionProps={{ members, variant: 'bogus' }} />,
    );
    const grid = renderToStaticMarkup(
      <Team sectionProps={{ members, variant: 'grid' }} />,
    );
    expect(unknown).toBe(grid);
  });

  it('cada variante produce un marcado distinguible', () => {
    const grid = renderToStaticMarkup(
      <Team sectionProps={{ members, variant: 'grid' }} />,
    );
    const list = renderToStaticMarkup(
      <Team sectionProps={{ members, variant: 'list' }} />,
    );
    expect(grid).toContain('data-variant="grid"');
    expect(list).toContain('data-variant="list"');
    expect(grid).not.toEqual(list);
  });
});

  

  it('las imágenes del equipo cargan diferidas y conservan el nombre como alt', () => {
    const html = renderToStaticMarkup(
      <Team 
        sectionProps={{
          title: 'Title',
          members: [{ name: 'Juan', role: 'Dev', photoUrl: 'https://img.com/juan.jpg' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Juan"');
    expect(html).not.toContain('<link rel="preload"');
  });

describe('Timeline', () => {
  const steps = [
    { title: 'Diagnóstico', description: 'Levantamos la necesidad.' },
    { title: 'Propuesta', description: 'Enviamos una cotización.', date: 'Marzo 2026' },
  ];

  it('sin steps no renderiza nada', () => {
    const html = renderToStaticMarkup(<Timeline sectionProps={{ title: 'Proceso' }} />);
    expect(html).toBe('');
  });

  it('con steps el contenido aparece', () => {
    const html = renderToStaticMarkup(
      <Timeline sectionProps={{ title: 'Proceso', steps }} />,
    );
    expect(html).toContain('Proceso');
    expect(html).toContain('Diagnóstico');
    expect(html).toContain('Propuesta');
  });

  it('usa una lista ordenada <ol>', () => {
    const html = renderToStaticMarkup(<Timeline sectionProps={{ steps }} />);
    expect(html).toContain('<ol');
    expect(html).toContain('</ol>');
  });

  it('sin date numera el paso; con date muestra la fecha', () => {
    const html = renderToStaticMarkup(<Timeline sectionProps={{ steps }} />);
    expect(html).toContain('Paso 1');
    expect(html).toContain('Marzo 2026');
    expect(html).not.toContain('Paso 2');
  });

  it('sin variant, el HTML es idéntico al de "vertical" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Timeline sectionProps={{ steps }} />);
    const vertical = renderToStaticMarkup(
      <Timeline sectionProps={{ steps, variant: 'vertical' }} />,
    );
    expect(withoutVariant).toBe(vertical);
  });

  it('una variante desconocida cae a "vertical"', () => {
    const unknown = renderToStaticMarkup(
      <Timeline sectionProps={{ steps, variant: 'bogus' }} />,
    );
    const vertical = renderToStaticMarkup(
      <Timeline sectionProps={{ steps, variant: 'vertical' }} />,
    );
    expect(unknown).toBe(vertical);
  });

  it('cada variante produce un marcado distinguible', () => {
    const vertical = renderToStaticMarkup(
      <Timeline sectionProps={{ steps, variant: 'vertical' }} />,
    );
    const horizontal = renderToStaticMarkup(
      <Timeline sectionProps={{ steps, variant: 'horizontal' }} />,
    );
    expect(vertical).toContain('data-variant="vertical"');
    expect(horizontal).toContain('data-variant="horizontal"');
    expect(horizontal).toContain('md:flex-row');
    expect(vertical).not.toContain('md:flex-row');
  });
});

describe('VideoBlock', () => {
  const youtubeProps = { title: 'Mira esto', videoUrl: 'https://youtu.be/dQw4w9WgXcQ' };

  it('sin videoUrl no renderiza nada', () => {
    const html = renderToStaticMarkup(
      <VideoBlock sectionProps={{ title: 'Sin video' }} />,
    );
    expect(html).toBe('');
  });

  it('con videoUrl el contenido aparece', () => {
    const html = renderToStaticMarkup(<VideoBlock sectionProps={youtubeProps} />);
    expect(html).toContain('Mira esto');
  });

  it('el HTML del servidor no trae un <iframe> (carga diferida)', () => {
    const html = renderToStaticMarkup(<VideoBlock sectionProps={youtubeProps} />);
    expect(html).not.toContain('<iframe');
  });

  it('el HTML del servidor trae la portada y el botón de reproducir', () => {
    const html = renderToStaticMarkup(
      <VideoBlock
        sectionProps={{
          ...youtubeProps,
          posterUrl: 'https://bucket.example.com/poster.jpg',
        }}
      />,
    );
    expect(html).toContain('https://bucket.example.com/poster.jpg');
    expect(html).toContain('aria-label="Reproducir video"');
  });

  it('sin posterUrl igual muestra el botón de reproducir, nunca un hueco vacío', () => {
    const html = renderToStaticMarkup(<VideoBlock sectionProps={youtubeProps} />);
    expect(html).toContain('aria-label="Reproducir video"');
  });

  it('sin variant, el HTML es idéntico al de "contained" explícito', () => {
    const withoutVariant = renderToStaticMarkup(
      <VideoBlock sectionProps={youtubeProps} />,
    );
    const contained = renderToStaticMarkup(
      <VideoBlock sectionProps={{ ...youtubeProps, variant: 'contained' }} />,
    );
    expect(withoutVariant).toBe(contained);
  });

  it('una variante desconocida cae a "contained"', () => {
    const unknown = renderToStaticMarkup(
      <VideoBlock sectionProps={{ ...youtubeProps, variant: 'bogus' }} />,
    );
    const contained = renderToStaticMarkup(
      <VideoBlock sectionProps={{ ...youtubeProps, variant: 'contained' }} />,
    );
    expect(unknown).toBe(contained);
  });

  it('cada variante produce un marcado distinguible', () => {
    const contained = renderToStaticMarkup(
      <VideoBlock sectionProps={{ ...youtubeProps, variant: 'contained' }} />,
    );
    const full = renderToStaticMarkup(
      <VideoBlock sectionProps={{ ...youtubeProps, variant: 'full' }} />,
    );
    expect(contained).toContain('data-variant="contained"');
    expect(full).toContain('data-variant="full"');
    expect(contained).toContain('ui-card');
    expect(full).not.toContain('ui-card');
  });
});

describe('AnnouncementBar', () => {
  const props = {
    message: 'Envío gratis esta semana',
    linkLabel: 'Ver más',
    linkHref: '/promo',
  };

  it('sin message no renderiza nada', () => {
    const html = renderToStaticMarkup(<AnnouncementBar sectionProps={{}} />);
    expect(html).toBe('');
  });

  it('el mensaje y el enlace aparecen', () => {
    const html = renderToStaticMarkup(<AnnouncementBar sectionProps={props} />);
    expect(html).toContain('Envío gratis esta semana');
    expect(html).toContain('Ver más');
    expect(html).toContain('href="/promo"');
  });

  it('con dismissible: false no hay botón de cerrar', () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, dismissible: false }} />,
    );
    expect(html).not.toContain('aria-label="Cerrar aviso"');
  });

  it('por defecto (dismissible), el botón de cerrar aparece', () => {
    const html = renderToStaticMarkup(<AnnouncementBar sectionProps={props} />);
    expect(html).toContain('aria-label="Cerrar aviso"');
  });

  it('sin variant, el HTML es idéntico al de "top" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<AnnouncementBar sectionProps={props} />);
    const top = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, variant: 'top' }} />,
    );
    expect(withoutVariant).toBe(top);
  });

  it('una variante desconocida cae a "top"', () => {
    const unknown = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, variant: 'bogus' }} />,
    );
    const top = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, variant: 'top' }} />,
    );
    expect(unknown).toBe(top);
  });

  it('cada variante produce un marcado distinguible', () => {
    const top = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, variant: 'top' }} />,
    );
    const inline = renderToStaticMarkup(
      <AnnouncementBar sectionProps={{ ...props, variant: 'inline' }} />,
    );
    expect(top).toContain('data-variant="top"');
    expect(inline).toContain('data-variant="inline"');
    expect(top).not.toEqual(inline);
  });
});

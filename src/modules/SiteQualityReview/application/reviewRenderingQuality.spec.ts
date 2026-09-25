import { reviewRenderingQuality } from './reviewRenderingQuality';
import type { AdminPage } from '@/modules/Admin/domain/AdminApi';

// Página publicada mínima para construir casos de prueba sin repetir boilerplate.
function makePage(overrides: Partial<AdminPage> = {}): AdminPage {
  return {
    id: '1',
    slug: 'home',
    title: 'Inicio',
    description: null,
    isPublished: true,
    visualStyle: null,
    sections: [],
    ...overrides,
  };
}

function gallerySection(imageCount: number, id = 'g1'): AdminPage['sections'][number] {
  return {
    id,
    type: 'Gallery',
    position: 1,
    props: { images: Array.from({ length: imageCount }, (_, i) => ({ url: `https://example.com/${i}.jpg`, alt: '' })) },
    anchor: null,
    isHidden: false,
  };
}

function heroSection(imageCount: number): AdminPage['sections'][number] {
  return {
    id: 'h1',
    type: 'Hero',
    position: 0,
    props: { images: Array.from({ length: imageCount }, (_, i) => `https://example.com/hero-${i}.jpg`) },
    anchor: null,
    isHidden: false,
  };
}

describe('reviewRenderingQuality — galería con demasiadas imágenes', () => {
  it('genera una observación cuando una Gallery tiene más de 20 imágenes', () => {
    const page = makePage({ sections: [gallerySection(21)] });
    const observations = reviewRenderingQuality([page]);
    expect(observations).toHaveLength(1);
    expect(observations[0]?.what).toMatch(/21 imágenes/);
    expect(observations[0]?.where).toContain('Inicio');
  });

  it('no genera observación cuando la Gallery tiene 20 imágenes o menos', () => {
    const page = makePage({ sections: [gallerySection(20)] });
    const observations = reviewRenderingQuality([page]);
    expect(observations).toHaveLength(0);
  });
});

describe('reviewRenderingQuality — carrusel hero con demasiadas fotos', () => {
  it('genera una observación cuando el Hero tiene más de 5 imágenes', () => {
    const page = makePage({ sections: [heroSection(6)] });
    const observations = reviewRenderingQuality([page]);
    expect(observations).toHaveLength(1);
    expect(observations[0]?.what).toMatch(/6 imágenes/);
  });

  it('no genera observación cuando el Hero tiene 5 imágenes o menos', () => {
    const page = makePage({ sections: [heroSection(5)] });
    const observations = reviewRenderingQuality([page]);
    expect(observations).toHaveLength(0);
  });
});

describe('reviewRenderingQuality — demasiados bloques con galería en la misma página', () => {
  it('genera una observación cuando hay más de 3 bloques Gallery o BeforeAfter', () => {
    const sections: AdminPage['sections'] = [
      gallerySection(2, 'g1'),
      gallerySection(2, 'g2'),
      gallerySection(2, 'g3'),
      { id: 'ba1', type: 'BeforeAfter', position: 4, props: {}, anchor: null, isHidden: false },
    ];
    const page = makePage({ sections });
    const observations = reviewRenderingQuality([page]);
    // La observación de bloques pesados está; puede haber otras de las otras reglas.
    expect(observations.some((o) => o.what.includes('4 bloques'))).toBe(true);
  });

  it('no genera observación cuando hay 3 o menos bloques con galería', () => {
    const sections: AdminPage['sections'] = [
      gallerySection(2, 'g1'),
      gallerySection(2, 'g2'),
      gallerySection(2, 'g3'),
    ];
    const page = makePage({ sections });
    const heavyBlockObs = reviewRenderingQuality([page]).filter((o) =>
      o.what.includes('bloques'),
    );
    expect(heavyBlockObs).toHaveLength(0);
  });
});

describe('reviewRenderingQuality — páginas sin publicar', () => {
  it('no genera observaciones para páginas sin publicar', () => {
    const page = makePage({
      isPublished: false,
      sections: [gallerySection(25)],
    });
    const observations = reviewRenderingQuality([page]);
    expect(observations).toHaveLength(0);
  });
});

describe('reviewRenderingQuality — formato de las observaciones', () => {
  it('devuelve observaciones con severity improvable y fix con instrucción concreta', () => {
    const page = makePage({ sections: [gallerySection(21)] });
    const [obs] = reviewRenderingQuality([page]);
    expect(obs?.severity).toBe('improvable');
    expect(obs?.fix).toBeTruthy();
    expect(obs?.where).toBeTruthy();
  });
});

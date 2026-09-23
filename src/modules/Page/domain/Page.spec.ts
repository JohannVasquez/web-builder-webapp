import { PageSchema } from './Page';

describe('PageSchema', () => {
  const base = { slug: 'home', title: 'Inicio', description: null, sections: [] };

  it('tolera campos nuevos de la API en vez de tumbar la página', () => {
    const parsed = PageSchema.safeParse({ ...base, algoNuevo: 1 });

    expect(parsed.success).toBe(true);
  });

  it('una API que todavía no manda el estilo deja la página heredando el del sitio', () => {
    expect(PageSchema.parse(base).visualStyle).toBeNull();
  });

  it('lee el estilo propio de la página', () => {
    expect(PageSchema.parse({ ...base, visualStyle: 'claymorphism' }).visualStyle).toBe(
      'claymorphism',
    );
  });
});

import { NO_INDEX, robotsFor } from './seo';

describe('robotsFor', () => {
  it('lo marcado como no indexable sale del índice', () => {
    expect(robotsFor(true)).toEqual(NO_INDEX);
  });

  it('lo marcado como indexable no impone nada: hereda del sitio', () => {
    expect(robotsFor(false)).toBeUndefined();
  });

  it('sin el dato tampoco: ausente significa que se indexa, que es el estado normal', () => {
    // La API todavía puede no mandarlo (web-builder-api#63) y una respuesta en caché de
    // antes tampoco lo trae.
    expect(robotsFor(undefined)).toBeUndefined();
  });

  it('no indexar implica tampoco seguir sus enlaces', () => {
    expect(NO_INDEX).toEqual({ index: false, follow: false });
  });
});

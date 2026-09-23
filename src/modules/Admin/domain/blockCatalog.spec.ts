import {
  BLOCK_CATALOG,
  blockThumbnailRects,
  groupBlockCatalog,
  BLOCK_FAMILY_LABELS,
} from './blockCatalog';

describe('groupBlockCatalog', () => {
  it('agrupa todos los bloques del catálogo, sin perder ninguno', () => {
    const groups = groupBlockCatalog();
    const total = groups.reduce((sum, group) => sum + group.entries.length, 0);
    expect(total).toBe(BLOCK_CATALOG.length);
  });

  it('no genera familias vacías', () => {
    const groups = groupBlockCatalog();
    expect(groups.every((group) => group.entries.length > 0)).toBe(true);
  });

  it('usa la etiqueta en español de cada familia', () => {
    const groups = groupBlockCatalog();
    for (const group of groups) {
      expect(group.label).toBe(BLOCK_FAMILY_LABELS[group.family]);
    }
  });

  it('cada bloque queda en el grupo que declara su propia familia', () => {
    const groups = groupBlockCatalog();
    for (const group of groups) {
      expect(group.entries.every((entry) => entry.family === group.family)).toBe(true);
    }
  });
});

describe('blockThumbnailRects', () => {
  it('todo tipo del catálogo tiene una miniatura con al menos un rectángulo', () => {
    for (const entry of BLOCK_CATALOG) {
      expect(blockThumbnailRects(entry.type).length).toBeGreaterThan(0);
    }
  });

  it('un tipo desconocido recibe la miniatura genérica en vez de fallar', () => {
    expect(blockThumbnailRects('EstoNoExiste').length).toBeGreaterThan(0);
  });

  it('ningún rectángulo se sale del lienzo de 100x60', () => {
    for (const entry of BLOCK_CATALOG) {
      for (const rect of blockThumbnailRects(entry.type)) {
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(100);
        expect(rect.y + rect.height).toBeLessThanOrEqual(60);
      }
    }
  });

  it('la portada (Hero) es una franja grande con un botón destacado', () => {
    const rects = blockThumbnailRects('Hero');
    expect(rects.some((rect) => rect.width > 80)).toBe(true);
    expect(rects.some((rect) => rect.tone === 'accent')).toBe(true);
  });

  it('la grilla de características (Features) son tres cuadritos', () => {
    const rects = blockThumbnailRects('Features').filter(
      (rect) => rect.width === rect.height,
    );
    expect(rects.length).toBe(3);
  });
});

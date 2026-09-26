import { BLOCK_PROPS_HINTS } from './blockHints';
import { BLOCK_CATALOG } from './blockCatalog';

describe('blockHints', () => {
  it('todo bloque del catálogo debe tener ayuda de props escrita a mano', () => {
    const describedBlocks = Object.keys(BLOCK_PROPS_HINTS);

    for (const entry of BLOCK_CATALOG) {
      expect(describedBlocks).toContain(entry.type);
      expect(BLOCK_PROPS_HINTS[entry.type].length).toBeGreaterThan(0);
    }
  });

  it('cada vez que se menciona un campo de imagen en la ayuda, incluye la advertencia de NO usar URLs firmadas', () => {
    const imageKeywords = ['imageUrl', 'photoUrl', 'avatarUrl', 'posterUrl', 'beforeUrl', 'afterUrl', 'images', 'logos', 'backgroundImageUrl'];

    for (const [_type, hint] of Object.entries(BLOCK_PROPS_HINTS)) {
      for (const keyword of imageKeywords) {
        if (hint.includes(keyword)) {
          expect(hint).toContain('identificador (key)');
          expect(hint).toContain('upload_media');
          expect(hint).toContain('URLs firmadas vencen');
        }
      }
    }
  });
});

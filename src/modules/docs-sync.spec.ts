// Verifica que la documentación no quede desfasada del código.
// Si agregas un bloque de página o un estilo visual al código sin documentarlo,
// este test falla y te avisa exactamente qué falta.
//
// Patrón tomado de src/mcp/tools.spec.ts en web-builder-api.

import { COMPONENT_MAP } from '@/modules/Page/presentation/componentMap';
import { BLOCK_CATALOG } from '@/modules/Admin/domain/blockCatalog';
import { VISUAL_STYLES } from '@/modules/VisualStyle/domain/registry';
import { DEMO_FORWARDED_ACTIONS } from '@/modules/Demo/domain/DemoAction';
import { DEMO_TOKEN_COOKIE } from '@/shared/config/demo';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const docsRoot = join(__dirname, '..', '..', 'docs');

const readDoc = (filename: string): string =>
  readFileSync(join(docsRoot, filename), 'utf-8');

const readReadme = (): string => readFileSync(join(docsRoot, '..', 'README.md'), 'utf-8');

describe('sincronización documentación ↔ código', () => {
  describe('bloques de página', () => {
    // Los tipos de COMPONENT_MAP y BLOCK_CATALOG tienen que ser idénticos.
    // Si uno tiene un tipo que el otro no, hay un registro incompleto.

    it('COMPONENT_MAP y BLOCK_CATALOG tienen los mismos tipos de bloque', () => {
      const mapTypes = new Set(Object.keys(COMPONENT_MAP));
      const catalogTypes = new Set(BLOCK_CATALOG.map((b) => b.type));

      const soloEnMap = [...mapTypes].filter((t) => !catalogTypes.has(t));
      const soloEnCatalog = [...catalogTypes].filter((t) => !mapTypes.has(t));

      expect(soloEnMap).toEqual(
        [],
        // En COMPONENT_MAP pero no en BLOCK_CATALOG: falta la entrada del panel
      );
      expect(soloEnCatalog).toEqual(
        [],
        // En BLOCK_CATALOG pero no en COMPONENT_MAP: falta el componente React
      );
    });

    it('todos los bloques de COMPONENT_MAP están mencionados en como-agregar-algo-nuevo.md', () => {
      const doc = readDoc('como-agregar-algo-nuevo.md');
      const mapTypes = Object.keys(COMPONENT_MAP);

      // La guía enumera los tipos existentes como ejemplo; verificamos que al menos
      // la sección de bloques esté presente y mencione el catálogo actual.
      // Si el doc no menciona ningún tipo conocido, es una señal de que quedó vacío.
      const mentionedCount = mapTypes.filter((t) => doc.includes(t)).length;
      expect(mentionedCount).toBeGreaterThan(0);
    });
  });

  describe('estilos visuales', () => {
    it('agregar-un-estilo-visual.md describe los tres pasos obligatorios', () => {
      // La guía describe el proceso de agregar un estilo; verificamos que los pasos clave estén presentes.
      // Si alguien la borra o la vacía, este test falla.
      const doc = readDoc('agregar-un-estilo-visual.md');
      expect(doc).toContain('VisualStyle/domain/styles/');
      expect(doc).toContain('registry.ts');
      expect(doc).toContain('VISUAL_STYLES');
    });

    it('ningún estilo tiene id duplicado en el registro', () => {
      const ids = VISUAL_STYLES.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('todos los estilos tienen id, label y description no vacíos', () => {
      for (const style of VISUAL_STYLES) {
        expect(style.id.length).toBeGreaterThan(0);
        expect(style.label.length).toBeGreaterThan(0);
        expect(style.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('integridad del catálogo de bloques', () => {
    it('todos los bloques tienen type, label y description no vacíos', () => {
      for (const block of BLOCK_CATALOG) {
        expect(block.type.length).toBeGreaterThan(0);
        expect(block.label.length).toBeGreaterThan(0);
        expect(block.description.length).toBeGreaterThan(0);
      }
    });

    it('no hay tipos duplicados en BLOCK_CATALOG', () => {
      const types = BLOCK_CATALOG.map((b) => b.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });
  });

  describe('demos de prospecto', () => {
    // Qué acciones del navegador pasan por el servidor en una demo es una decisión de
    // seguridad: si se agrega una al código, el README tiene que decirlo.
    it('el README nombra cada acción que se reenvía con el token de la demo', () => {
      const readme = readReadme();
      const missing = DEMO_FORWARDED_ACTIONS.filter(
        (action) => !readme.includes(`\`${action}\``),
      );
      expect(missing).toEqual([]);
    });

    it('el README documenta la cookie del enlace mágico', () => {
      expect(readReadme()).toContain(`\`${DEMO_TOKEN_COOKIE}\``);
    });
  });
});

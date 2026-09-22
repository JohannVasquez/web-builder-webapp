import { renderToStaticMarkup } from 'react-dom/server';
import { SectionList } from './PageEditor';
import type { AdminSection } from '../domain/AdminApi';

const visibleSection: AdminSection = {
  id: '018f6f1a-0000-7000-8000-000000000001',
  type: 'Hero',
  position: 0,
  props: { title: 'Bienvenida' },
  anchor: null,
  isHidden: false,
};

const hiddenSection: AdminSection = {
  id: '018f6f1a-0000-7000-8000-000000000002',
  type: 'Faq',
  position: 1,
  props: {},
  anchor: null,
  isHidden: true,
};

const noop = (): void => {
  // No hace nada: la prueba solo mira el marcado, no las llamadas a estos callbacks.
};

const baseProps = {
  editingId: null,
  draft: '',
  jsonError: null,
  isBusy: false,
  dragOverId: null,
  onDragStart: noop,
  onDragOver: noop,
  onDrop: noop,
  onDragEnd: noop,
  onMoveUp: noop,
  onMoveDown: noop,
  onDuplicate: noop,
  onToggleHidden: noop,
  onStartEdit: noop,
  onDelete: noop,
  onDraftChange: noop,
  onSave: noop,
  onCancelEdit: noop,
};

describe('SectionList', () => {
  it('sin bloques muestra el mensaje de lista vacía', () => {
    const html = renderToStaticMarkup(<SectionList {...baseProps} sections={[]} />);
    expect(html).toContain('Esta página no tiene bloques todavía.');
  });

  it('un bloque visible no lleva la etiqueta de oculto ni el aviso', () => {
    const html = renderToStaticMarkup(
      <SectionList {...baseProps} sections={[visibleSection]} />,
    );
    expect(html).toContain('Portada');
    expect(html).toContain('Bienvenida');
    expect(html).not.toContain('Oculto');
    expect(html).not.toContain('sigue en el borrador');
    expect(html).toContain('Ocultar');
  });

  it('un bloque oculto se marca claramente y ofrece volver a mostrarlo', () => {
    const html = renderToStaticMarkup(
      <SectionList {...baseProps} sections={[hiddenSection]} />,
    );
    expect(html).toContain('Oculto');
    expect(html).toContain('Sigue en el borrador, pero no sale en el sitio publicado.');
    expect(html).toContain('Mostrar');
    expect(html).not.toContain('>Ocultar<');
  });

  it('el primer bloque no puede subir y el último no puede bajar', () => {
    const html = renderToStaticMarkup(
      <SectionList {...baseProps} sections={[visibleSection, hiddenSection]} />,
    );
    const upButtons = html.match(/aria-label="Subir bloque"[^>]*disabled/g) ?? [];
    const downButtons = html.match(/aria-label="Bajar bloque"[^>]*disabled/g) ?? [];
    expect(upButtons.length).toBe(1);
    expect(downButtons.length).toBe(1);
  });

  it('en modo edición muestra el textarea con el borrador y el error de JSON', () => {
    const html = renderToStaticMarkup(
      <SectionList
        {...baseProps}
        sections={[visibleSection]}
        editingId={visibleSection.id}
        draft='{"title": "hola"}'
        jsonError="JSON inválido"
      />,
    );
    expect(html).toContain('Contenido del bloque (JSON)');
    expect(html).toContain('hola');
    expect(html).toContain('JSON inválido');
    expect(html).toContain('Guardar');
    expect(html).toContain('Cancelar');
  });
});

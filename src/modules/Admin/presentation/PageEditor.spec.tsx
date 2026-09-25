/** @jest-environment jsdom */

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

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageSeoForm } from './PageEditor';
import { useAdminApi } from './useAdminApi';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));

jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn().mockReturnValue({ data: [], error: null, isLoading: false }),
  refreshAsyncData: jest.fn(),
}));

jest.mock('./useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PageSeoForm', () => {
  const baseSeoProps = {
    tenantId: 't1',
    pageId: 'p1',
    pageTitle: 'Página de Prueba',
    initialSeoTitle: null,
    initialSeoDescription: null,
    initialOgImageKey: null,
    initialNoindex: false,
  };

  it('rellena los campos con lo que ya tenía la página', () => {
    render(
      <PageSeoForm
        {...baseSeoProps}
        initialSeoTitle="Mi Título SEO"
        initialSeoDescription="Mi Descripción"
        initialOgImageKey="images/foto.jpg"
        initialNoindex={true}
      />,
    );
    expect(screen.getByLabelText(/Título SEO/)).toHaveValue('Mi Título SEO');
    expect(screen.getByLabelText(/Descripción SEO/)).toHaveValue('Mi Descripción');
    expect(screen.getByLabelText(/Imagen al compartir/)).toHaveValue('images/foto.jpg');
    expect(screen.getByLabelText(/Ocultar de buscadores/)).toBeChecked();
  });

  it('un campo vacío se manda como null', async () => {
    const user = userEvent.setup();
    const mockPatch = jest.fn().mockResolvedValue({ page: {} });
    (useAdminApi as jest.Mock).mockReturnValue({
      patch: mockPatch,
      get: jest.fn().mockResolvedValue({ assets: [] }),
    });

    render(<PageSeoForm {...baseSeoProps} initialSeoTitle="Título Viejo" />);

    const titleInput = screen.getByLabelText(/Título SEO/);
    await user.clear(titleInput); // lo dejamos vacío

    const saveButton = screen.getByRole('button', { name: /Guardar SEO/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/admin/tenants/t1/pages/p1',
        {
          seoTitle: null,
          seoDescription: null,
          ogImageKey: null,
          noindex: false,
        },
        expect.anything(),
      );
    });
  });

  it('el aviso de largo aparece al pasarse', async () => {
    const user = userEvent.setup();
    render(<PageSeoForm {...baseSeoProps} />);

    const titleInput = screen.getByLabelText(/Título SEO/);
    await user.type(titleInput, 'a'.repeat(61));

    expect(screen.getByText(/El título es muy largo.*Sobran 1 caracteres/)).toBeTruthy();

    const descInput = screen.getByLabelText(/Descripción SEO/);
    await user.type(descInput, 'b'.repeat(161));

    expect(
      screen.getByText(/La descripción es muy larga.*Sobran 1 caracteres/),
    ).toBeTruthy();
  });

  it('la imagen elegida se guarda como key', async () => {
    const user = userEvent.setup();
    const mockPatch = jest.fn().mockResolvedValue({ page: {} });
    (useAdminApi as jest.Mock).mockReturnValue({
      patch: mockPatch,
      get: jest.fn().mockResolvedValue({ assets: [] }),
    });

    render(<PageSeoForm {...baseSeoProps} />);

    const imageInput = screen.getByLabelText(/Imagen al compartir/);
    await user.type(imageInput, 'nueva/imagen.png');

    const saveButton = screen.getByRole('button', { name: /Guardar SEO/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ogImageKey: 'nueva/imagen.png',
        }),
        expect.anything(),
      );
    });
  });
});

/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CreateDemoForm } from './CreateDemoForm';
import { useAdminApi } from './useAdminApi';
import { AdminApiError } from '../application/AdminApiClient';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { CREATED_DEMO, TEMPLATES } from './demoTestData';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
  revalidateAsyncData: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() }),
}));

describe('CreateDemoForm', () => {
  const api = { post: jest.fn(), get: jest.fn() };
  const onCreated = jest.fn();

  beforeEach(() => {
    (useAdminApi as jest.Mock).mockReturnValue(api);
    (useAsyncData as jest.Mock).mockReturnValue({
      data: TEMPLATES,
      error: null,
      isLoading: false,
    });
  });

  const renderForm = (): void => {
    render(
      <CreateDemoForm
        platformDomain="webbuilder.cl"
        existingProspect={null}
        onCreated={onCreated}
        onCancel={jest.fn()}
      />,
    );
  };

  it('propone la dirección desde el negocio y muestra cómo la verá el prospecto', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Negocio'), 'Pastelería Luna');

    expect(screen.getByLabelText('Dirección')).toHaveValue('pasteleria-luna');
    expect(screen.getByText('demo-pasteleria-luna.webbuilder.cl')).toBeInTheDocument();
  });

  it('sin negocio no llama a la API y explica qué falta', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Crear demo' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Escribe el nombre del negocio.');
    expect(screen.getByLabelText('Negocio')).toHaveAttribute('aria-invalid', 'true');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('crea la demo desde un kit con los datos del prospecto', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue(CREATED_DEMO);
    renderForm();

    await user.type(screen.getByLabelText('Negocio'), 'Pastelería Luna');
    await user.type(screen.getByLabelText('Teléfono (opcional)'), '+56 9 1234 5678');
    await user.type(screen.getByLabelText('Notas (opcional)'), '4,8 estrellas');
    await user.selectOptions(screen.getByLabelText('Kit por rubro'), 'pasteleria');
    await user.click(screen.getByRole('button', { name: 'Crear demo' }));

    expect(api.post).toHaveBeenCalledWith(
      '/api/admin/demos',
      {
        slug: 'pasteleria-luna',
        name: 'Pastelería Luna',
        templateId: 'pasteleria',
        prospect: {
          businessName: 'Pastelería Luna',
          contactName: null,
          phone: '+56 9 1234 5678',
          email: null,
          industry: null,
          source: null,
          notes: '4,8 estrellas',
        },
      },
      expect.anything(),
    );
    expect(onCreated).toHaveBeenCalledWith(CREATED_DEMO);
  });

  it('si la dirección está ocupada ofrece la sugerencia de la API con un clic', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValue(
      new AdminApiError(
        'Ya existe una demo en "demo-pasteleria-luna".',
        409,
        [],
        'pasteleria-luna-2',
      ),
    );
    renderForm();

    await user.type(screen.getByLabelText('Negocio'), 'Pastelería Luna');
    await user.click(screen.getByLabelText(/Vacía/));
    await user.click(screen.getByRole('button', { name: 'Crear demo' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe una demo');
    await user.click(screen.getByRole('button', { name: 'Usar «pasteleria-luna-2»' }));

    expect(screen.getByLabelText('Dirección')).toHaveValue('pasteleria-luna-2');
    expect(screen.getByText('demo-pasteleria-luna-2.webbuilder.cl')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('una segunda propuesta no vuelve a pedir los datos del prospecto', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue(CREATED_DEMO);
    render(
      <CreateDemoForm
        platformDomain="webbuilder.cl"
        existingProspect={{ id: 'p1', businessName: 'Pastelería Luna' }}
        onCreated={onCreated}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByLabelText('Negocio')).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText('Dirección'));
    await user.type(screen.getByLabelText('Dirección'), 'luna-moderna');
    await user.click(screen.getByLabelText(/Vacía/));
    await user.click(screen.getByRole('button', { name: 'Crear demo' }));

    expect(api.post).toHaveBeenCalledWith(
      '/api/admin/demos',
      { slug: 'luna-moderna', name: 'Pastelería Luna', prospectId: 'p1' },
      expect.anything(),
    );
  });
});

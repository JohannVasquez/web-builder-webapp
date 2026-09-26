/** @jest-environment jsdom */
import "@testing-library/jest-dom";


import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessSettingsForm } from './BusinessSettingsForm';
import { useAdminApi } from './useAdminApi';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

jest.mock('./useAdminApi', () => ({
  useAdminApi: jest.fn(),
}));

jest.mock('./useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: jest.fn(),
}));

const mockGet = jest.fn();
const mockPut = jest.fn();

const useAdminApiMock = useAdminApi as jest.Mock;
const useUnsavedChangesGuardMock = useUnsavedChangesGuard as jest.Mock;

describe('BusinessSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminApiMock.mockReturnValue({
      get: mockGet,
      put: mockPut,
    });
  });

  const validSettings = {
    siteName: 'Mi Sitio',
    tagline: 'Lo mejor',
    contactEmail: 'hola@ejemplo.com',
    contactPhone: '9999999',
    whatsappNumber: '56912345678',
    address: 'Calle 123',
    openingHours: JSON.stringify({
      monday: { isOpen: true, slots: [{ open: '09:00', close: '18:00' }] },
      tuesday: { isOpen: false },
      wednesday: { isOpen: false },
      thursday: { isOpen: false },
      friday: { isOpen: false },
      saturday: { isOpen: false },
      sunday: { isOpen: false },
    }),
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    xUrl: '',
    customLinkUrl: '',
    customLinkLabel: '',
    googleAnalyticsId: '',
    metaPixelId: '',
    googleTagManagerId: '',
    cookieBanner: '',
    googleSiteVerification: '',
    bingSiteVerification: '',
    siteUnderConstruction: '',
  };

  it('carga los valores existentes al abrir', async () => {
    mockGet.mockResolvedValueOnce(validSettings);
    render(<BusinessSettingsForm tenantId="t1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre del sitio/i)).toHaveValue('Mi Sitio');
    });

    expect(screen.getByLabelText(/Correo de contacto/i)).toHaveValue('hola@ejemplo.com');
  });

  it('un correo sin arroba no deja guardar y muestra error', async () => {
    mockGet.mockResolvedValueOnce(validSettings);
    render(<BusinessSettingsForm tenantId="t1" />);

    await waitFor(() => expect(screen.getByLabelText(/Correo de contacto/i)).toHaveValue('hola@ejemplo.com'));

    const input = screen.getByLabelText(/Correo de contacto/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'correo-invalido');

    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/El correo "correo-invalido" no es válido/i)).toBeInTheDocument();
    });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('WhatsApp con espacios y guiones se acepta', async () => {
    mockGet.mockResolvedValueOnce(validSettings);
    mockPut.mockResolvedValueOnce({ ...validSettings, whatsappNumber: '56987654321' });
    render(<BusinessSettingsForm tenantId="t1" />);

    await waitFor(() => expect(screen.getByLabelText(/Número de WhatsApp/i)).toHaveValue('56912345678'));

    const input = screen.getByLabelText(/Número de WhatsApp/i);
    await userEvent.clear(input);
    await userEvent.type(input, '+56 9 8765-4321');

    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        '/api/admin/tenants/t1/settings',
        expect.objectContaining({ whatsappNumber: '+56 9 8765-4321' }), // Se envía tal cual, API lo normaliza
        expect.any(Object)
      );
    });
  });

  it('los horarios se arman día por día', async () => {
    mockGet.mockResolvedValueOnce(validSettings);
    mockPut.mockResolvedValueOnce(validSettings);
    render(<BusinessSettingsForm tenantId="t1" />);

    // Esperar a que se monte el input del martes (de OpeningHoursInput)
    await waitFor(() => expect(screen.getByLabelText(/^Martes$/i)).toBeInTheDocument());

    const martesCheckbox = screen.getByLabelText(/^Martes$/i);
    expect(martesCheckbox).not.toBeChecked();

    await userEvent.click(martesCheckbox);
    expect(martesCheckbox).toBeChecked();

    const addSlotBtn = screen.getAllByRole('button', { name: /Agregar tramo/i })[1];
    expect(addSlotBtn).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Nombre del sitio/i);
    await userEvent.type(titleInput, ' Algo');

    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalled();
    });

    // , @typescript-eslint/no-unsafe-member-access
    const putCallArgs = (mockPut.mock.calls[0] as unknown[])[1] as { openingHours: string };
    // 
    const hours = JSON.parse(putCallArgs.openingHours) as Record<string, { isOpen: boolean, slots: Array<{ open: string, close: string }> }>;
    // 
    expect(hours.tuesday.isOpen).toBe(true);
    // 
    expect(hours.tuesday.slots).toHaveLength(1);
    // 
    expect(hours.tuesday.slots[0].open).toBe('09:00');
  });

  it('avisa al intentar salir con cambios sin guardar', async () => {
    mockGet.mockResolvedValueOnce(validSettings);
    render(<BusinessSettingsForm tenantId="t1" />);

    await waitFor(() => expect(screen.getByLabelText(/Nombre del sitio/i)).toHaveValue('Mi Sitio'));

    expect(useUnsavedChangesGuardMock).toHaveBeenCalledWith(false);

    const input = screen.getByLabelText(/Nombre del sitio/i);
    await userEvent.type(input, ' Nuevo');

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenCalledWith(true);
    });
  });
});

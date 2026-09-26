/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantRedirects } from './TenantRedirects';
import { useAdminApi } from './useAdminApi';

jest.mock('./useAdminApi');

describe('TenantRedirects', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
      remove: mockRemove,
    });
  });

  it('lista las redirecciones y permite crear una nueva', async () => {
    mockGet.mockResolvedValueOnce({ redirects: [] });

    render(<TenantRedirects tenantId="t1" />);

    expect(await screen.findByText('Este cliente todavía no tiene redirecciones.')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /agregar redirección/i }));

    const fromInput = screen.getByLabelText(/ruta antigua/i);
    const toInput = screen.getByLabelText(/ruta nueva/i);
    
    await user.type(fromInput, '/vieja');
    await user.type(toInput, '/nueva');
    
    mockPost.mockResolvedValueOnce({ redirect: { id: '1', fromPath: '/vieja', toPath: '/nueva', statusCode: 301, createdAt: '' } });
    mockGet.mockResolvedValueOnce({ redirects: [{ id: '1', fromPath: '/vieja', toPath: '/nueva', statusCode: 301, createdAt: '' }] });
    
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        `/api/admin/tenants/t1/redirecciones`,
        { fromPath: '/vieja', toPath: '/nueva', statusCode: 301 },
        expect.anything()
      );
    });

    expect(await screen.findByText('/vieja')).toBeInTheDocument();
    expect(await screen.findByText('/nueva')).toBeInTheDocument();
  });

  it('permite eliminar una redirección', async () => {
    mockGet.mockResolvedValueOnce({
      redirects: [{ id: '1', fromPath: '/borrar', toPath: '/nueva', statusCode: 301, createdAt: '' }],
    });
    
    window.confirm = jest.fn().mockReturnValue(true);

    render(<TenantRedirects tenantId="t2" />);

    expect(await screen.findByText('/borrar')).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /eliminar redirección de "\/borrar"/i });
    
    mockRemove.mockResolvedValueOnce(undefined);
    mockGet.mockResolvedValueOnce({ redirects: [] });

    const user = userEvent.setup();
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(`/api/admin/tenants/t2/redirecciones/1`);
    });

    expect(await screen.findByText('Este cliente todavía no tiene redirecciones.')).toBeInTheDocument();
  });
});

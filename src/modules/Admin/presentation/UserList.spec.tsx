import { renderToStaticMarkup } from 'react-dom/server';
import { UserList } from './UserManager';
import type { UserAccount } from '../domain/AdminApi';

const owner: UserAccount = {
  id: 1,
  email: 'ana@webbuilder.co',
  name: 'Ana',
  role: 'owner',
  disabled: false,
    tenantScope: null,
};

const disabledEditor: UserAccount = {
  id: 2,
  email: 'ben@webbuilder.co',
  name: 'Ben',
  role: 'editor',
  disabled: true,
    tenantScope: null,
};

const noop = (): void => {
  // No hace nada: la prueba solo mira el marcado, no las llamadas a estos callbacks.
};

describe('UserList', () => {
  const tenantNames = new Map([
    [40, 'Pastelería Luna'],
    [9, 'ElectroAndes'],
  ]);

  it('sin personas muestra el mensaje de lista vacía', () => {
    const html = renderToStaticMarkup(
      <UserList
        users={[]}
        pendingActionId={null}
      tenantNames={tenantNames}
        onRoleChange={noop}
        onStatusChange={noop}
      />,
    );
    expect(html).toContain('Todavía no hay personas con acceso al panel.');
  });

  it('muestra el correo y el rol de cada persona', () => {
    const html = renderToStaticMarkup(
      <UserList
        users={[owner]}
        pendingActionId={null}
      tenantNames={tenantNames}
        onRoleChange={noop}
        onStatusChange={noop}
      />,
    );
    expect(html).toContain('Ana');
    expect(html).toContain('ana@webbuilder.co');
    expect(html).toContain('Activa');
  });

  it('la fila de una persona desactivada se marca como tal y ofrece reactivarla', () => {
    const html = renderToStaticMarkup(
      <UserList
        users={[disabledEditor]}
        pendingActionId={null}
      tenantNames={tenantNames}
        onRoleChange={noop}
        onStatusChange={noop}
      />,
    );
    expect(html).toContain('Ben');
    expect(html).toContain('Desactivada');
    expect(html).toContain('Reactivar');
    expect(html).not.toContain('Desactivar');
  });

  it('una persona activa ofrece desactivarla, no reactivarla', () => {
    const html = renderToStaticMarkup(
      <UserList
        users={[owner]}
        pendingActionId={null}
      tenantNames={tenantNames}
        onRoleChange={noop}
        onStatusChange={noop}
      />,
    );
    expect(html).toContain('Desactivar');
    expect(html).not.toContain('Reactivar');
  });
});

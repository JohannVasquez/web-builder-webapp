import {
  roleLabel,
  describeUserStatus,
  canManageUsers,
  describeUserScope,
  needsTenantScope,
} from './userPresentation';

describe('roleLabel', () => {
  it('traduce el rol a su etiqueta en español', () => {
    expect(roleLabel('owner')).toBe('Dueña de la cuenta');
    expect(roleLabel('editor')).toBe('Editora');
  });
});

describe('describeUserStatus', () => {
  it('marca a una persona activa', () => {
    expect(describeUserStatus({ disabled: false })).toEqual({
      label: 'Activa',
      isActive: true,
    });
  });

  it('marca a una persona desactivada', () => {
    expect(describeUserStatus({ disabled: true })).toEqual({
      label: 'Desactivada',
      isActive: false,
    });
  });
});

describe('canManageUsers', () => {
  it('solo la dueña de la cuenta puede gestionar usuarios', () => {
    expect(canManageUsers('owner')).toBe(true);
    expect(canManageUsers('editor')).toBe(false);
  });
});

describe('alcance del rol cliente', () => {
  const tenantNames = new Map([
    [40, 'Pastelería Luna'],
    [9, 'ElectroAndes'],
  ]);

  it('solo el rol cliente necesita clientes asignados', () => {
    expect(needsTenantScope('client')).toBe(true);
    expect(needsTenantScope('editor')).toBe(false);
    expect(needsTenantScope('owner')).toBe(false);
  });

  it('la agencia alcanza a todos los clientes', () => {
    expect(
      describeUserScope({ role: 'editor', tenantScope: null }, tenantNames),
    ).toBe('Todos los clientes');
  });

  it('nombra los clientes de una persona en vez de mostrar ids', () => {
    expect(
      describeUserScope({ role: 'client', tenantScope: [40, 9] }, tenantNames),
    ).toBe('Pastelería Luna, ElectroAndes');
  });

  it('avisa cuando quedó sin ninguno', () => {
    expect(describeUserScope({ role: 'client', tenantScope: [] }, tenantNames)).toBe(
      'Sin clientes asignados',
    );
  });

  it('no se rompe si el cliente ya no existe', () => {
    expect(
      describeUserScope({ role: 'client', tenantScope: [999] }, tenantNames),
    ).toBe('Cliente 999');
  });
});

import { roleLabel, describeUserStatus, canManageUsers } from './userPresentation';

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

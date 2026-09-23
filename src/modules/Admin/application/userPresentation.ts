import type { AdminRole } from '@/modules/Auth/domain/Session';
import type { UserAccount } from '../domain/AdminApi';

export interface RoleOption {
  readonly value: AdminRole;
  readonly label: string;
  readonly description: string;
}

// Texto fijo en español para que el formulario y el listado usen las mismas palabras.
export const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    value: 'owner',
    label: 'Dueña de la cuenta',
    description: 'Acceso completo: puede gestionar clientes, claves y otras personas.',
  },
  {
    value: 'editor',
    label: 'Editora',
    description:
      'Puede trabajar en los clientes, pero no ve claves de acceso ni usuarios.',
  },
  {
    value: 'client',
    label: 'Cliente',
    description:
      'Edita solo los sitios que le asignes y no puede borrar ni dar de alta clientes.',
  },
];

// El rol cliente no significa nada sin sitios asignados, así que la API lo rechaza.
export const needsTenantScope = (role: AdminRole): boolean => role === 'client';

export const describeUserScope = (
  user: Pick<UserAccount, 'role' | 'tenantScope'>,
  tenantNames: ReadonlyMap<string, string>,
): string => {
  if (user.role !== 'client' || user.tenantScope === null) {
    return 'Todos los clientes';
  }
  if (user.tenantScope.length === 0) {
    return 'Sin clientes asignados';
  }
  return user.tenantScope
    .map((id) => tenantNames.get(id) ?? `Cliente ${String(id)}`)
    .join(', ');
};

export const roleLabel = (role: AdminRole): string =>
  ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;

export interface UserStatusPresentation {
  readonly label: string;
  readonly isActive: boolean;
}

export const describeUserStatus = (
  user: Pick<UserAccount, 'disabled'>,
): UserStatusPresentation =>
  user.disabled
    ? { label: 'Desactivada', isActive: false }
    : { label: 'Activa', isActive: true };

// Solo la dueña de la cuenta administra usuarios y claves (SPEC 9.2).
export const canManageUsers = (role: AdminRole): boolean => role === 'owner';

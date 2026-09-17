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
];

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

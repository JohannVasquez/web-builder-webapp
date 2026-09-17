'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Ban, Loader2, Plus, RotateCcw } from 'lucide-react';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import {
  UserAccountsSchema,
  UserAccountResponseSchema,
  type UserAccount,
} from '../domain/AdminApi';
import {
  ROLE_OPTIONS,
  roleLabel,
  describeUserStatus,
} from '../application/userPresentation';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const USERS_CACHE_KEY = 'admin:users';

const FIELD_LABELS: Record<string, string> = {
  email: 'Correo',
  name: 'Nombre',
  role: 'Rol',
};

const STATUS_BADGE_CLASSES: Record<'active' | 'disabled', string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  disabled: 'bg-muted text-muted-foreground',
};

export interface UserListProps {
  readonly users: readonly UserAccount[];
  readonly pendingActionId: number | null;
  readonly onRoleChange: (user: UserAccount, nextRole: AdminRole) => void;
  readonly onStatusChange: (user: UserAccount, disabled: boolean) => void;
}

// Sin hooks propios (ni sesión ni datos remotos) para poder renderizarla en pruebas con
// `renderToStaticMarkup` sin tener que simular el contexto de sesión ni la API.
export function UserList({
  users,
  pendingActionId,
  onRoleChange,
  onStatusChange,
}: UserListProps): ReactElement {
  if (users.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay personas con acceso al panel.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {users.map((user) => {
        const status = describeUserStatus(user);
        const isPending = pendingActionId === user.id;
        return (
          <li
            key={user.id}
            className={`ui-card space-y-3 p-5 ${status.isActive ? '' : 'opacity-60'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_BADGE_CLASSES[status.isActive ? 'active' : 'disabled']
                }`}
              >
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Label
                htmlFor={`role-${String(user.id)}`}
                className="text-muted-foreground"
              >
                Rol
              </Label>
              <select
                id={`role-${String(user.id)}`}
                className="ui-input h-9 px-2 text-sm"
                value={user.role}
                disabled={isPending}
                onChange={(event) => onRoleChange(user, event.target.value as AdminRole)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {status.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => onStatusChange(user, true)}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Ban className="size-4" />
                  )}
                  Desactivar
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onStatusChange(user, false)}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Reactivar
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function UserManager(): ReactElement {
  const api = useAdminApi();
  const users = useAsyncData(USERS_CACHE_KEY, async () => {
    const { users: list } = await api.get('/api/admin/users', UserAccountsSchema);
    return list;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    issues: readonly { path: string; message: string }[];
  } | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const resetForm = (): void => {
    setEmail('');
    setName('');
    setRole('editor');
    setFormError(null);
  };

  const handleInvite = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    if (email.trim() === '' || name.trim() === '') {
      setFormError({ message: 'Completa el correo y el nombre.', issues: [] });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(
        '/api/admin/users',
        { email: email.trim(), name: name.trim(), role },
        UserAccountResponseSchema,
      );
      refreshAsyncData(USERS_CACHE_KEY);
      resetForm();
      setIsFormOpen(false);
      toast.success(
        'Invitamos a esa persona. Le llegará un correo para elegir su contraseña.',
      );
    } catch (cause) {
      setFormError(
        describeAdminError(
          cause,
          'No pudimos invitar a esa persona. Inténtalo nuevamente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (
    user: UserAccount,
    nextRole: AdminRole,
  ): Promise<void> => {
    if (nextRole === user.role) {
      return;
    }
    const confirmed = window.confirm(
      `Vas a cambiar el rol de ${user.name} a "${roleLabel(nextRole)}". ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingActionId(user.id);
    try {
      await api.patch(
        `/api/admin/users/${String(user.id)}/role`,
        { role: nextRole },
        UserAccountResponseSchema,
      );
      refreshAsyncData(USERS_CACHE_KEY);
      toast.success('Rol actualizado.');
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos cambiar el rol. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const handleStatusChange = async (
    user: UserAccount,
    disabled: boolean,
  ): Promise<void> => {
    if (disabled) {
      const confirmed = window.confirm(
        `Vas a desactivar a ${user.name}. No podrá entrar al panel hasta que la reactives. ¿Continuar?`,
      );
      if (!confirmed) {
        return;
      }
    }
    setPendingActionId(user.id);
    try {
      await api.patch(
        `/api/admin/users/${String(user.id)}/status`,
        { disabled },
        UserAccountResponseSchema,
      );
      refreshAsyncData(USERS_CACHE_KEY);
      toast.success(disabled ? 'Cuenta desactivada.' : 'Cuenta reactivada.');
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos actualizar el estado. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">Usuarios</h1>
        <Button type="button" onClick={() => setIsFormOpen((open) => !open)}>
          <Plus className="size-4" /> Invitar persona
        </Button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={(event) => void handleInvite(event)}
          className="ui-card space-y-5 p-6"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="user-email">Correo</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="persona@ejemplo.cl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre y apellido"
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Rol</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="ui-input flex cursor-pointer items-start gap-2 p-3 text-sm has-[:checked]:border-primary"
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {formError !== null && (
            <div role="alert" className="text-destructive space-y-1 text-sm">
              <p>{formError.message}</p>
              {formError.issues.length > 0 && (
                <ul className="list-disc pl-5">
                  {formError.issues.map((issue) => (
                    <li key={issue.path}>
                      {FIELD_LABELS[issue.path] ?? issue.path}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />} Invitar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {users.error !== null && (
        <p role="alert" className="text-destructive">
          {users.error}
        </p>
      )}

      {users.error === null && (users.isLoading || users.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando usuarios...
        </p>
      )}

      {users.data !== null && (
        <UserList
          users={users.data}
          pendingActionId={pendingActionId}
          onRoleChange={(user, nextRole) => void handleRoleChange(user, nextRole)}
          onStatusChange={(user, disabled) => void handleStatusChange(user, disabled)}
        />
      )}
    </div>
  );
}

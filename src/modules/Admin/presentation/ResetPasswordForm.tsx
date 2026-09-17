'use client';

import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AuthService } from '@/modules/Auth/application/AuthService';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const MIN_PASSWORD_LENGTH = 10;

interface ResetPasswordFormProps {
  readonly token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps): ReactElement {
  const router = useRouter();
  const authService = useMemo(() => new AuthService(getPublicApiBaseUrl()), []);

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token === null || token.trim() === '') {
    return (
      <div className="ui-card mx-auto w-full max-w-sm space-y-3 p-8">
        <h1 className="ui-heading text-2xl">Enlace no válido</h1>
        <p className="text-muted-foreground text-sm">
          Este enlace de recuperación no trae la información necesaria. Pide uno nuevo
          desde la pantalla de inicio de sesión.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    // Se explica el mínimo antes de enviar, no solo como error del servidor.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${String(MIN_PASSWORD_LENGTH)} caracteres.`,
      );
      return;
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
      router.replace('/');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No pudimos actualizar tu contraseña. Inténtalo nuevamente.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card mx-auto w-full max-w-sm space-y-5 p-8"
      noValidate
    >
      <div className="space-y-1">
        <h1 className="ui-heading text-2xl">Elige tu nueva contraseña</h1>
        <p className="text-muted-foreground text-sm">
          Debe tener al menos {MIN_PASSWORD_LENGTH} caracteres.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Contraseña nueva</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirma la contraseña</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>

      {error !== null && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Guardar contraseña
      </Button>
    </form>
  );
}

'use client';

import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AuthService,
  InvalidCredentialsError,
  TooManyAttemptsError,
} from '@/modules/Auth/application/AuthService';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function LoginForm(): ReactElement {
  const { signIn } = useSession();
  const router = useRouter();
  const authService = useMemo(() => new AuthService(getPublicApiBaseUrl()), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      signIn(await authService.login(email, password));
      router.replace('/');
    } catch (cause) {
      setError(messageFor(cause));
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
        <h1 className="ui-heading text-2xl">Panel de administración</h1>
        <p className="text-muted-foreground text-sm">Entra con tu correo y contraseña.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error !== null && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}

// Cada fallo se explica en los términos de quien lo está viendo, no con el código HTTP.
const messageFor = (cause: unknown): string => {
  if (cause instanceof InvalidCredentialsError || cause instanceof TooManyAttemptsError) {
    return cause.message;
  }
  return 'No pudimos iniciar sesión. Revisa tu conexión e inténtalo nuevamente.';
};

'use client';

import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthService } from '@/modules/Auth/application/AuthService';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface ForgotPasswordFormProps {
  readonly onBackToLogin: () => void;
}

// Siempre muestra el mismo mensaje al enviar, exista o no la cuenta: así nadie puede usar
// este formulario para averiguar qué correos tienen cuenta en el panel.
export function ForgotPasswordForm({
  onBackToLogin,
}: ForgotPasswordFormProps): ReactElement {
  const authService = useMemo(() => new AuthService(getPublicApiBaseUrl()), []);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      setMessage(await authService.forgotPassword(email.trim()));
    } catch {
      setMessage(
        'Si ese correo tiene una cuenta, te llegará un enlace para cambiar la contraseña.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message !== null) {
    return (
      <div className="ui-card mx-auto w-full max-w-sm space-y-5 p-8">
        <div className="space-y-1">
          <h1 className="ui-heading text-2xl">Revisa tu correo</h1>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
        >
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card mx-auto w-full max-w-sm space-y-5 p-8"
      noValidate
    >
      <div className="space-y-1">
        <h1 className="ui-heading text-2xl">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm">
          Escribe tu correo y te enviaremos un enlace para elegir una contraseña nueva.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Correo</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Enviar enlace
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBackToLogin}>
          Volver a iniciar sesión
        </Button>
      </div>
    </form>
  );
}

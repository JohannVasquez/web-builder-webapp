import type { ReactElement } from 'react';
import { ResetPasswordForm } from '@/modules/Admin/presentation/ResetPasswordForm';

interface ResetPasswordPageProps {
  readonly searchParams: Promise<{ token?: string | string[] }>;
}

// `AdminShell` deja pasar esta ruta sin la guarda de sesión: el enlace llega por correo y
// nunca hay sesión activa al abrirlo.
export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<ReactElement> {
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === 'string' ? tokenParam : null;

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <ResetPasswordForm token={token} />
    </div>
  );
}

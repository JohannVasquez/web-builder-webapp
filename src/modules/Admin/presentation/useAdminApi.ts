'use client';

import { useMemo } from 'react';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { AdminApiClient } from '../application/AdminApiClient';

// Se recrea al cambiar el token para que, tras volver a entrar, la siguiente llamada use
// el token nuevo sin remontar la pantalla.
export const useAdminApi = (): AdminApiClient => {
  const { token } = useSession();
  return useMemo(() => new AdminApiClient(getPublicApiBaseUrl(), () => token), [token]);
};

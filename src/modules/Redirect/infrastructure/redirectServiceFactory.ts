import { getApiBaseUrl } from '@/shared/config/api';
import { RedirectService } from '../application/RedirectService';
import { ApiRedirectRepository } from './ApiRedirectRepository';

export const createRedirectService = (tenantDomain: string): RedirectService => {
  return new RedirectService(new ApiRedirectRepository(getApiBaseUrl(), tenantDomain));
};

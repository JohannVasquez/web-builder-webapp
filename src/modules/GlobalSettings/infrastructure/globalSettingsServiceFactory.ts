import { getApiBaseUrl } from '@/shared/config/api';
import { GlobalSettingsService } from '../application/GlobalSettingsService';
import { ApiGlobalSettingsRepository } from './ApiGlobalSettingsRepository';

export const createGlobalSettingsService = (
  tenantDomain?: string,
): GlobalSettingsService => {
  return new GlobalSettingsService(
    new ApiGlobalSettingsRepository(getApiBaseUrl(), tenantDomain),
  );
};

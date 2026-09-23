import { getApiBaseUrl } from '@/shared/config/api';
import { StoreService } from '../application/StoreService';
import { ApiStoreRepository } from './ApiStoreRepository';

export const createStoreService = (tenantDomain?: string): StoreService => {
  return new StoreService(new ApiStoreRepository(getApiBaseUrl(), tenantDomain));
};

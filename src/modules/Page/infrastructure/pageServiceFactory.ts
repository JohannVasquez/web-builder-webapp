import { getApiBaseUrl } from '@/shared/config/api';
import { PageService } from '../application/PageService';
import { ApiPageRepository } from './ApiPageRepository';

export const createPageService = (tenantDomain?: string): PageService => {
  return new PageService(new ApiPageRepository(getApiBaseUrl(), tenantDomain));
};

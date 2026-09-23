import { getApiBaseUrl } from '@/shared/config/api';
import { BlogService } from '../application/BlogService';
import { ApiBlogRepository } from './ApiBlogRepository';

export const createBlogService = (tenantDomain?: string): BlogService => {
  return new BlogService(new ApiBlogRepository(getApiBaseUrl(), tenantDomain));
};

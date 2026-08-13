import { getApiBaseUrl } from '@/shared/config/api';
import { NavigationService } from '../application/NavigationService';
import { ApiNavigationRepository } from './ApiNavigationRepository';

export const createNavigationService = (): NavigationService => {
  return new NavigationService(new ApiNavigationRepository(getApiBaseUrl()));
};

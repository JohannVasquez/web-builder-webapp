import { NavigationService } from './NavigationService';
import { DEFAULT_NAVIGATION_LINKS, type NavigationLink } from '../domain/NavigationLink';
import type { NavigationRepository } from '../domain/NavigationRepository';

describe('NavigationService', () => {
  const links: NavigationLink[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Contacto', href: '/contacto' },
  ];

  it('returns the links from the repository', async () => {
    const repository: jest.Mocked<NavigationRepository> = {
      findAll: jest.fn().mockResolvedValue(links),
    };
    const service = new NavigationService(repository);

    const result = await service.getLinks();

    expect(result).toEqual(links);
  });

  it('falls back to a minimal menu when the repository fails', async () => {
    const repository: jest.Mocked<NavigationRepository> = {
      findAll: jest.fn().mockRejectedValue(new Error('API down')),
    };
    const service = new NavigationService(repository);

    const result = await service.getLinks();

    expect(result).toEqual(DEFAULT_NAVIGATION_LINKS);
  });
});

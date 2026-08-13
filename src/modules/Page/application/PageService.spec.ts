import { PageService } from './PageService';
import type { Page } from '../domain/Page';
import type { PageRepository } from '../domain/PageRepository';

describe('PageService', () => {
  const page: Page = {
    slug: 'nosotros',
    title: 'Nosotros',
    description: 'Quiénes somos',
    sections: [{ type: 'Hero', position: 1, props: { title: 'Hola' }, anchor: null }],
  };

  it('delegates the lookup to the repository and returns the page', async () => {
    const repository: jest.Mocked<PageRepository> = {
      findBySlug: jest.fn().mockResolvedValue(page),
    };
    const service = new PageService(repository);

    const result = await service.getPage('nosotros');

    expect(repository.findBySlug).toHaveBeenCalledWith('nosotros');
    expect(result).toEqual(page);
  });

  it('returns null when the page does not exist', async () => {
    const repository: jest.Mocked<PageRepository> = {
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const service = new PageService(repository);

    const result = await service.getPage('no-existe');

    expect(result).toBeNull();
  });
});

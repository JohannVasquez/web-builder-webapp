import { StoreService } from './StoreService';
import type { ProductListResponse, ProductView } from '../domain/Product';
import type { StoreRepository } from '../domain/StoreRepository';
import type { StoreSettings } from '../domain/StoreSettings';

describe('StoreService', () => {
  const listResponse: ProductListResponse = {
    products: [],
    total: 0,
    page: 1,
    perPage: 12,
  };

  const fakeRepository = (
    overrides: Partial<jest.Mocked<StoreRepository>> = {},
  ): jest.Mocked<StoreRepository> => ({
    listProducts: jest.fn().mockResolvedValue(listResponse),
    getFeaturedProducts: jest.fn().mockResolvedValue([]),
    findProductBySlug: jest.fn().mockResolvedValue(null),
    listCategories: jest.fn().mockResolvedValue([]),
    getStoreSettings: jest.fn().mockResolvedValue(null),
    ...overrides,
  });

  it('delegates listProducts to the repository', async () => {
    const repository = fakeRepository({
      listProducts: jest.fn().mockResolvedValue(listResponse),
    });
    const service = new StoreService(repository);

    const result = await service.listProducts({ page: 1, perPage: 12 });

    expect(repository.listProducts).toHaveBeenCalledWith({ page: 1, perPage: 12 });
    expect(result).toEqual(listResponse);
  });

  it('returns an empty list instead of throwing when the API is down', async () => {
    const repository = fakeRepository({
      listProducts: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    });
    const service = new StoreService(repository);

    const result = await service.listProducts({ page: 2, perPage: 6 });

    expect(result).toEqual({ products: [], total: 0, page: 2, perPage: 6 });
  });

  it('returns [] instead of throwing when featured products fail', async () => {
    const repository = fakeRepository({
      getFeaturedProducts: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    });
    const service = new StoreService(repository);

    await expect(service.getFeaturedProducts(4)).resolves.toEqual([]);
  });

  it('returns the product from the repository', async () => {
    const product = { slug: 'torta-de-chocolate' } as unknown as ProductView;
    const repository = fakeRepository({
      findProductBySlug: jest.fn().mockResolvedValue(product),
    });
    const service = new StoreService(repository);

    const result = await service.getProduct('torta-de-chocolate');

    expect(result).toBe(product);
  });

  it('returns null instead of throwing when getProduct fails', async () => {
    const repository = fakeRepository({
      findProductBySlug: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    });
    const service = new StoreService(repository);

    await expect(service.getProduct('torta-de-chocolate')).resolves.toBeNull();
  });

  it('returns [] instead of throwing when listCategories fails', async () => {
    const repository = fakeRepository({
      listCategories: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    });
    const service = new StoreService(repository);

    await expect(service.listCategories()).resolves.toEqual([]);
  });

  it('returns the settings from the repository', async () => {
    const settings = { isEnabled: true } as unknown as StoreSettings;
    const repository = fakeRepository({
      getStoreSettings: jest.fn().mockResolvedValue(settings),
    });
    const service = new StoreService(repository);

    await expect(service.getStoreSettings()).resolves.toBe(settings);
  });

  it('returns null instead of throwing when getStoreSettings fails', async () => {
    const repository = fakeRepository({
      getStoreSettings: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    });
    const service = new StoreService(repository);

    await expect(service.getStoreSettings()).resolves.toBeNull();
  });
});

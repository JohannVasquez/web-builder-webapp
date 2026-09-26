import {
  FeaturedProductsResponseSchema,
  ProductCategoriesResponseSchema,
  ProductListResponseSchema,
  ProductResponseSchema,
  type ProductCategory,
  type ProductListResponse,
  type ProductView,
} from '../domain/Product';
import type { ProductListParams, StoreRepository } from '../domain/StoreRepository';
import { StoreSettingsResponseSchema, type StoreSettings } from '../domain/StoreSettings';

import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { siteCacheOptions } from '@/shared/lib/cacheTags';
import { readDemoToken } from '@/shared/lib/demoAccess';

// En una demo de prospecto `/api/media/<clave>` responde 404: lo piden el navegador y el
// optimizador de imágenes, y ninguno de los dos puede llevar el token. Sin la clave, las
// vistas caen a la URL firmada que la API manda al lado, que no pasa por la guarda.
const withoutMediaKeys = (product: ProductView): ProductView => {
  const { imageKeys: _imageKeys, ...rest } = product;
  return rest;
};

const forDemo = async (
  products: readonly ProductView[],
): Promise<readonly ProductView[]> =>
  (await readDemoToken()) === undefined ? products : products.map(withoutMediaKeys);

export class ApiStoreRepository implements StoreRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  private tenantHeaders(): HeadersInit | undefined {
    return this.tenantDomain === undefined
      ? undefined
      : { [TENANT_DOMAIN_HEADER]: this.tenantDomain };
  }

  private async fetchOptions(): Promise<RequestInit> {
    const options = await siteCacheOptions(this.tenantDomain);
    return { ...options, headers: { ...options.headers, ...this.tenantHeaders() } };
  }

  public async listProducts(params: ProductListParams): Promise<ProductListResponse> {
    const query = new URLSearchParams({
      page: String(params.page),
      perPage: String(params.perPage),
    });
    if (params.search !== undefined) {
      query.set('search', params.search);
    }
    if (params.category !== undefined) {
      query.set('category', params.category);
    }

    const response = await fetch(
      `${this.baseUrl}/api/products?${query.toString()}`,
      await this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list products: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    const list = ProductListResponseSchema.parse(payload);
    return { ...list, products: [...(await forDemo(list.products))] };
  }

  public async getFeaturedProducts(limit: number): Promise<readonly ProductView[]> {
    const response = await fetch(
      `${this.baseUrl}/api/products/destacados?limit=${limit}`,
      await this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list featured products: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return forDemo(FeaturedProductsResponseSchema.parse(payload).products);
  }

  public async findProductBySlug(slug: string): Promise<ProductView | null> {
    const response = await fetch(
      `${this.baseUrl}/api/products/${encodeURIComponent(slug)}`,
      await this.fetchOptions(),
    );

    // 400 = el slug no cumple el formato aceptado por la API. Desde el visitante es una URL
    // que no existe, así que es un 404 y no un error (mismo criterio que ApiBlogRepository).
    if (response.status === 404 || response.status === 400) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch product "${slug}": HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    const [product] = await forDemo([ProductResponseSchema.parse(payload).product]);
    return product ?? null;
  }

  public async listCategories(): Promise<readonly ProductCategory[]> {
    const response = await fetch(
      `${this.baseUrl}/api/product-categories`,
      await this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list product categories: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return ProductCategoriesResponseSchema.parse(payload).categories;
  }

  public async getStoreSettings(): Promise<StoreSettings | null> {
    const response = await fetch(`${this.baseUrl}/api/store`, await this.fetchOptions());

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch store settings: HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    return StoreSettingsResponseSchema.parse(payload).store;
  }
}

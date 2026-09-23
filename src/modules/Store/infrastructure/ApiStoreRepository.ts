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

  private fetchOptions(): RequestInit {
    return { ...siteCacheOptions(this.tenantDomain), headers: this.tenantHeaders() };
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
      this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list products: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return ProductListResponseSchema.parse(payload);
  }

  public async getFeaturedProducts(limit: number): Promise<readonly ProductView[]> {
    const response = await fetch(
      `${this.baseUrl}/api/products/destacados?limit=${limit}`,
      this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list featured products: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return FeaturedProductsResponseSchema.parse(payload).products;
  }

  public async findProductBySlug(slug: string): Promise<ProductView | null> {
    const response = await fetch(
      `${this.baseUrl}/api/products/${encodeURIComponent(slug)}`,
      this.fetchOptions(),
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
    return ProductResponseSchema.parse(payload).product;
  }

  public async listCategories(): Promise<readonly ProductCategory[]> {
    const response = await fetch(
      `${this.baseUrl}/api/product-categories`,
      this.fetchOptions(),
    );
    if (!response.ok) {
      throw new Error(`Failed to list product categories: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return ProductCategoriesResponseSchema.parse(payload).categories;
  }

  public async getStoreSettings(): Promise<StoreSettings | null> {
    const response = await fetch(`${this.baseUrl}/api/store`, this.fetchOptions());

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

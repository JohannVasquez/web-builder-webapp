import type { ProductCategory, ProductListResponse, ProductView } from './Product';
import type { StoreSettings } from './StoreSettings';

export interface ProductListParams {
  readonly page: number;
  readonly perPage: number;
  readonly search?: string;
  readonly category?: string;
}

export interface StoreRepository {
  listProducts(params: ProductListParams): Promise<ProductListResponse>;
  getFeaturedProducts(limit: number): Promise<readonly ProductView[]>;
  findProductBySlug(slug: string): Promise<ProductView | null>;
  listCategories(): Promise<readonly ProductCategory[]>;
  // `null` cuando el cliente no tiene tienda encendida (la API responde 404 en ese caso).
  getStoreSettings(): Promise<StoreSettings | null>;
}

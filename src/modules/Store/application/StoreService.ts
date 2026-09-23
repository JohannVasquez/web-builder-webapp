import type {
  ProductCategory,
  ProductListResponse,
  ProductView,
} from '../domain/Product';
import type { ProductListParams, StoreRepository } from '../domain/StoreRepository';
import type { StoreSettings } from '../domain/StoreSettings';

const EMPTY_LIST = (params: ProductListParams): ProductListResponse => ({
  products: [],
  total: 0,
  page: params.page,
  perPage: params.perPage,
});

// Mismo criterio que `BlogService`: una tienda caída no debería tumbar el catálogo, la ficha
// de producto ni el bloque "Productos destacados". Cada método traga el error del repositorio
// y devuelve vacío/null en su lugar.
export class StoreService {
  constructor(private readonly storeRepository: StoreRepository) {}

  public async listProducts(params: ProductListParams): Promise<ProductListResponse> {
    try {
      return await this.storeRepository.listProducts(params);
    } catch {
      return EMPTY_LIST(params);
    }
  }

  public async getFeaturedProducts(limit: number): Promise<readonly ProductView[]> {
    try {
      return await this.storeRepository.getFeaturedProducts(limit);
    } catch {
      return [];
    }
  }

  public async getProduct(slug: string): Promise<ProductView | null> {
    try {
      return await this.storeRepository.findProductBySlug(slug);
    } catch {
      return null;
    }
  }

  public async listCategories(): Promise<readonly ProductCategory[]> {
    try {
      return await this.storeRepository.listCategories();
    } catch {
      return [];
    }
  }

  // `null` también cuando el cliente no tiene tienda encendida: quien llama no distingue
  // "la API falló" de "no hay tienda", en ambos casos la respuesta correcta es no mostrarla.
  public async getStoreSettings(): Promise<StoreSettings | null> {
    try {
      return await this.storeRepository.getStoreSettings();
    } catch {
      return null;
    }
  }
}

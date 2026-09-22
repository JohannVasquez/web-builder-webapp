import { renderToStaticMarkup } from 'react-dom/server';
import { ProductForm } from './ProductForm';
import type { Product, ProductCategory } from '../domain/StoreApi';

jest.mock('./useAdminApi', () => ({
  useAdminApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    remove: jest.fn(),
  }),
}));

describe('ProductForm', () => {
  const dummyCategories: ProductCategory[] = [
    { id: '018f6f1a-0000-7000-8000-000000000001', name: 'Categoría 1', slug: 'cat-1' },
  ];

  it('renders form and displays initial values', () => {
    const product: Product = {
      id: '018f6f1a-0000-7000-8000-000000000001',
      slug: 'producto-1',
      name: 'Producto 1',
      description: 'Desc',
      imageKeys: [],
      priceCents: 10000,
      salePriceCents: null,
      currency: 'CLP',
      categoryId: '018f6f1a-0000-7000-8000-000000000001',
      variants: [],
      isActive: true,
      featured: false,
      position: 0,
      stock: null,
      isSoldOut: false,
    };

    const html = renderToStaticMarkup(
      <ProductForm
        tenantId={'018f6f1a-0000-7000-8000-000000000001'}
        product={product}
        categories={dummyCategories}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('Editar Producto');
    expect(html).toContain('Producto 1');
    expect(html).toContain('10000');
  });

  it('renders empty form for new product', () => {
    const html = renderToStaticMarkup(
      <ProductForm
        tenantId={'018f6f1a-0000-7000-8000-000000000001'}
        product={null}
        categories={dummyCategories}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('Crear Producto');
  });
});

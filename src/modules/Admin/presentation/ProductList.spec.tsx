import { renderToStaticMarkup } from 'react-dom/server';
import { ProductList } from './ProductList';
import type { Product, ProductCategory } from '../domain/StoreApi';

describe('ProductList', () => {
  const dummyCategories: ProductCategory[] = [{ id: '018f6f1a-0000-7000-8000-000000000001', name: 'Tortas', slug: 'tortas' }];

  const baseProduct: Product = {
    id: '018f6f1a-0000-7000-8000-000000000001',
    slug: 'torta-1',
    name: 'Torta de prueba',
    description: '',
    imageKeys: [],
    priceCents: 15000,
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

  it('renders products correctly', () => {
    const products: Product[] = [baseProduct];
    const html = renderToStaticMarkup(
      <ProductList
        products={products}
        categories={dummyCategories}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Torta de prueba');
    expect(html).toContain('Tortas');
  });

  it('shows sale price when applicable', () => {
    const products: Product[] = [{ ...baseProduct, salePriceCents: 12000 }];
    const html = renderToStaticMarkup(
      <ProductList
        products={products}
        categories={dummyCategories}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    // it should contain both normal and sale price
    expect(html).toContain('15.000');
    expect(html).toContain('12.000');
  });

  it('shows sold out badge', () => {
    const products: Product[] = [{ ...baseProduct, isSoldOut: true, stock: 0 }];
    const html = renderToStaticMarkup(
      <ProductList
        products={products}
        categories={dummyCategories}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Agotado');
  });

  it('shows inactive state', () => {
    const products: Product[] = [{ ...baseProduct, isActive: false }];
    const html = renderToStaticMarkup(
      <ProductList
        products={products}
        categories={dummyCategories}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Inactivo');
  });
});

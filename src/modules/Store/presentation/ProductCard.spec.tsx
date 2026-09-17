import { renderToStaticMarkup } from 'react-dom/server';
import type { ProductView } from '../domain/Product';
import { ProductCard } from './ProductCard';

const baseProduct: ProductView = {
  id: 1,
  slug: 'torta-de-chocolate',
  name: 'Torta de chocolate',
  description: 'Bizcocho húmedo con manjar y nueces.',
  imageUrls: [],
  priceCents: 29990,
  salePriceCents: null,
  currency: 'CLP',
  price: '$29.990',
  salePrice: null,
  hasDiscount: false,
  variants: [],
  categoryId: null,
  stock: null,
  isSoldOut: false,
  whatsappOrderUrl: null,
};

describe('ProductCard', () => {
  it('muestra el nombre y el precio', () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain('Torta de chocolate');
    expect(html).toContain('$29.990');
  });

  it('sin oferta no muestra un precio tachado', () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).not.toContain('line-through');
  });

  it('con oferta muestra el precio anterior tachado', () => {
    const onSale: ProductView = {
      ...baseProduct,
      hasDiscount: true,
      price: '$24.990',
      salePrice: '$29.990',
    };
    const html = renderToStaticMarkup(<ProductCard product={onSale} />);
    expect(html).toContain('$24.990');
    expect(html).toContain('$29.990');
    expect(html).toContain('line-through');
  });

  it('agotado muestra el sello "Agotado"', () => {
    const soldOut: ProductView = { ...baseProduct, isSoldOut: true };
    const html = renderToStaticMarkup(<ProductCard product={soldOut} />);
    expect(html).toContain('Agotado');
  });

  it('no agotado no muestra el sello', () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).not.toContain('Agotado');
  });

  it('enlaza a la ficha del producto', () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain('href="/tienda/torta-de-chocolate"');
  });
});

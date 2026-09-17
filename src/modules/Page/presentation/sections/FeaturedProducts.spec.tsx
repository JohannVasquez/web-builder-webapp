import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { ProductView } from '@/modules/Store/domain/Product';
import type { StoreService } from '@/modules/Store/application/StoreService';
import { FeaturedProducts } from './FeaturedProducts';

const product = (index: number): ProductView => ({
  id: index,
  slug: `producto-${index}`,
  name: `Producto ${index}`,
  description: 'Una descripción',
  imageUrls: [],
  priceCents: 10000,
  salePriceCents: null,
  currency: 'CLP',
  price: '$10.000',
  salePrice: null,
  hasDiscount: false,
  variants: [],
  categoryId: null,
  stock: null,
  isSoldOut: false,
  whatsappOrderUrl: null,
});

const fakeStoreService = (
  products: readonly ProductView[],
): { readonly service: StoreService; readonly getFeaturedProducts: jest.Mock } => {
  const getFeaturedProducts = jest.fn().mockResolvedValue(products);
  const service = {
    getFeaturedProducts,
    listProducts: jest.fn(),
    getProduct: jest.fn(),
    listCategories: jest.fn(),
    getStoreSettings: jest.fn(),
  } as unknown as StoreService;
  return { service, getFeaturedProducts };
};

const render = async (
  sectionProps: Record<string, unknown>,
  storeService: StoreService | undefined,
): Promise<ReactElement | null> => FeaturedProducts({ sectionProps, storeService });

describe('FeaturedProducts', () => {
  it('sin productos destacados no renderiza nada', async () => {
    const { service } = fakeStoreService([]);
    const element = await render({ title: 'Destacados' }, service);
    expect(element).toBeNull();
  });

  it('sin storeService no renderiza nada (no hay a quién pedirle productos)', async () => {
    const element = await render({ title: 'Destacados' }, undefined);
    expect(element).toBeNull();
  });

  it('con productos, aparecen sus nombres y precios', async () => {
    const { service } = fakeStoreService([product(1), product(2)]);
    const element = await render({ title: 'Lo más vendido' }, service);
    expect(element).not.toBeNull();
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain('Producto 1');
    expect(html).toContain('Producto 2');
    expect(html).toContain('Lo más vendido');
    expect(html).toContain('$10.000');
  });

  it('pide al servicio la cantidad pedida', async () => {
    const { service, getFeaturedProducts } = fakeStoreService([product(1)]);

    await render({ limit: 6 }, service);

    expect(getFeaturedProducts).toHaveBeenCalledWith(6);
  });

  it('sin límite pide el valor por defecto', async () => {
    const { service, getFeaturedProducts } = fakeStoreService([product(1)]);

    await render({}, service);

    expect(getFeaturedProducts).toHaveBeenCalledWith(4);
  });
});

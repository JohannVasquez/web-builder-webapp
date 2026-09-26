import { cookies } from 'next/headers';
import { ApiStoreRepository } from './ApiStoreRepository';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn(),
}));

const DEMO_TOKEN = `demo_${'7b'.repeat(32)}`;

const PRODUCT = {
  id: 'p1',
  slug: 'torta',
  name: 'Torta',
  description: '',
  imageUrls: ['https://bucket.example/firmada.jpg?sig=1'],
  imageKeys: ['tenant/torta.jpg'],
  priceCents: 1000,
  salePriceCents: null,
  currency: 'CLP',
  price: '$1.000',
  salePrice: null,
  hasDiscount: false,
  variants: [],
  categoryId: null,
  stock: null,
  isSoldOut: false,
  whatsappOrderUrl: null,
};

const withDemoCookie = (token: string | undefined): void => {
  (cookies as jest.Mock).mockResolvedValue({
    get: (name: string) =>
      name === 'demo_token' && token !== undefined ? { name, value: token } : undefined,
  });
};

describe('ApiStoreRepository en una demo de prospecto', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(Response.json({ product: PRODUCT }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // `/api/media/<clave>` lo piden el navegador y el optimizador de imágenes sin el token, y
  // en una demo eso es un 404: la ficha tiene que caer a la URL firmada.
  it('descarta las claves de imagen para que se use la URL firmada', async () => {
    withDemoCookie(DEMO_TOKEN);

    const product = await new ApiStoreRepository(
      'http://api',
      'demo-luna.cl',
    ).findProductBySlug('torta');

    expect(product?.imageKeys).toBeUndefined();
    expect(product?.imageUrls).toEqual(PRODUCT.imageUrls);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ 'X-Demo-Token': DEMO_TOKEN });
  });

  it('un cliente normal conserva la dirección estable', async () => {
    withDemoCookie(undefined);

    const product = await new ApiStoreRepository(
      'http://api',
      'acme.cl',
    ).findProductBySlug('torta');

    expect(product?.imageKeys).toEqual(PRODUCT.imageKeys);
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { ProductJsonLd } from './ProductJsonLd';
import type { ProductView } from '../domain/Product';
import type { StoreSettings } from '../domain/StoreSettings';

const SITE_URL = 'https://acme.cl';

const STORE: StoreSettings = {
  isEnabled: true,
  currency: 'CLP',
  taxIncluded: true,
  taxRatePercent: 19,
  shippingOptions: [
    {
      code: 'santiago',
      name: 'Despacho en Santiago',
      priceCents: 350000,
      estimate: '2 a 3 días hábiles',
      requiresAddress: true,
    },
  ],
  freeShippingThresholdCents: null,
  paymentProvider: 'none',
  notificationEmail: null,
  hasPaymentCredentials: false,
};

const PRODUCT: ProductView = {
  id: 'prod-1',
  slug: 'torta-chocolate',
  name: 'Torta de chocolate',
  description: 'Ocho porciones',
  imageUrls: ['https://bucket.example.com/torta.jpg'],
  priceCents: 2999000,
  salePriceCents: null,
  currency: 'CLP',
  price: '$29.990',
  salePrice: null,
  hasDiscount: false,
  variants: [],
  categoryId: null,
  stock: 4,
  isSoldOut: false,
  whatsappOrderUrl: null,
};

interface ShippingDetail {
  readonly name: string;
  readonly shippingRate: unknown;
}

interface Offer {
  readonly price: number;
  readonly priceValidUntil: string;
  readonly availability: string;
  readonly itemCondition: string;
  readonly seller: unknown;
  readonly shippingDetails?: readonly ShippingDetail[];
  readonly hasMerchantReturnPolicy: Record<string, unknown>;
}

interface ProductData {
  readonly sku: string;
  readonly offers: Offer;
}

const offerOf = (product: ProductView, store: StoreSettings = STORE): ProductData => {
  const html = renderToStaticMarkup(
    <ProductJsonLd product={product} siteUrl={SITE_URL} store={store} />,
  );
  const json = html.replace(/^.*?>/, '').replace(/<\/script>$/, '');
  return JSON.parse(json) as ProductData;
};

describe('ProductJsonLd', () => {
  it('el precio va en pesos, no en centavos', () => {
    // Antes se emitía `priceCents` tal cual: una torta de $29.990 se ofrecía a $2.999.000.
    expect(offerOf(PRODUCT).offers.price).toBe(29990);
  });

  it('con descuento se ofrece el precio que se paga hoy', () => {
    const rebajada = {
      ...PRODUCT,
      salePriceCents: 1999000,
      hasDiscount: true,
    };

    expect(offerOf(rebajada).offers.price).toBe(19990);
  });

  it('declara identificador y condición del producto', () => {
    const data = offerOf(PRODUCT);

    expect(data.sku).toBe('prod-1');
    expect(data.offers.itemCondition).toBe('https://schema.org/NewCondition');
  });

  it('el precio declara hasta cuándo vale', () => {
    const until = offerOf(PRODUCT).offers.priceValidUntil;

    expect(until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(until).getTime()).toBeGreaterThan(Date.now());
  });

  it('un producto agotado lo dice', () => {
    const agotado = { ...PRODUCT, stock: 0, isSoldOut: true };

    expect(offerOf(agotado).offers.availability).toBe('https://schema.org/OutOfStock');
    expect(offerOf(PRODUCT).offers.availability).toBe('https://schema.org/InStock');
  });

  it('el despacho sale de las formas de envío configuradas', () => {
    const shipping = offerOf(PRODUCT).offers.shippingDetails?.[0];

    expect(shipping?.name).toBe('Despacho en Santiago');
    expect(shipping?.shippingRate).toEqual({
      '@type': 'MonetaryAmount',
      value: 3500,
      currency: 'CLP',
    });
  });

  it('sin formas de envío no inventa ninguna', () => {
    const sinEnvio = { ...STORE, shippingOptions: [] };

    expect(offerOf(PRODUCT, sinEnvio).offers.shippingDetails).toBeUndefined();
  });

  it('declara los 10 días de retracto de la Ley 19.496', () => {
    expect(offerOf(PRODUCT).offers.hasMerchantReturnPolicy).toMatchObject({
      applicableCountry: 'CL',
      merchantReturnDays: 10,
    });
  });

  it('el vendedor es la organización del sitio, referenciada por @id', () => {
    expect(offerOf(PRODUCT).offers.seller).toEqual({
      '@id': 'https://acme.cl/#organization',
    });
  });
});

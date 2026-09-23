import type { ReactElement } from 'react';
import type { ProductView } from '../domain/Product';
import type { StoreSettings } from '../domain/StoreSettings';

interface ProductJsonLdProps {
  readonly product: ProductView;
  readonly siteUrl: string;
  readonly store: StoreSettings;
}

// Días de retracto que da la Ley 19.496 en las compras a distancia. Lo mismo que promete la
// plantilla de términos de compra: si los dos números se separan, el sitio se contradice solo.
const RETRACTO_DIAS = 10;

// Google descarta una oferta sin fecha de validez del precio, así que hay que declarar una.
// Un año es el horizonte que la documentación sugiere cuando el precio no tiene vencimiento
// real: suficiente para no caducar sola, corto para no mentir.
const PRICE_VALIDITY_DAYS = 365;

const priceValidUntil = (): string => {
  const until = new Date();
  until.setDate(until.getDate() + PRICE_VALIDITY_DAYS);
  return until.toISOString().slice(0, 10);
};

const shippingDetails = (
  store: StoreSettings,
  siteUrl: string,
): Record<string, unknown>[] =>
  store.shippingOptions.map((option) => ({
    '@type': 'OfferShippingDetails',
    name: option.name,
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: option.priceCents,
      currency: store.currency,
    },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CL' },
    ...(option.estimate === null ? {} : { description: option.estimate }),
    url: `${siteUrl}/tienda`,
  }));

// Datos estructurados de producto: sin esto un buscador ve la ficha como texto suelto en vez
// de un producto con precio y disponibilidad (mismo criterio que `BlogPostingJsonLd`).
export function ProductJsonLd({
  product,
  siteUrl,
  store,
}: ProductJsonLdProps): ReactElement {
  const shipping = shippingDetails(store, siteUrl);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    // El identificador propio del catálogo hace las veces de SKU: es estable y único por
    // producto, que es todo lo que schema.org pide.
    sku: product.id,
    ...(product.imageUrls.length === 0 ? {} : { image: product.imageUrls }),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/tienda/${product.slug}`,
      priceCurrency: product.currency,
      // Pese al nombre, `priceCents` guarda pesos enteros: en CLP la unidad mínima ES el
      // peso (ver `money.ts`). Dividir por 100 aquí convertiría $29.990 en $299,90.
      price:
        (product.hasDiscount ? product.salePriceCents : product.priceCents) ??
        product.priceCents,
      priceValidUntil: priceValidUntil(),
      availability: product.isSoldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${siteUrl}/#organization` },
      ...(shipping.length === 0 ? {} : { shippingDetails: shipping }),
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CL',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: RETRACTO_DIAS,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale del propio producto, ya validado por el schema de la tienda.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

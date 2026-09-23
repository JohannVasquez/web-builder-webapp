import type { ReactElement } from 'react';
import type { ProductView } from '../domain/Product';

interface ProductJsonLdProps {
  readonly product: ProductView;
  readonly siteUrl: string;
}

// Datos estructurados de producto: sin esto un buscador ve la ficha como texto suelto en vez
// de un producto con precio y disponibilidad (mismo criterio que `BlogPostingJsonLd`).
export function ProductJsonLd({ product, siteUrl }: ProductJsonLdProps): ReactElement {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(product.imageUrls.length === 0 ? {} : { image: product.imageUrls }),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/tienda/${product.slug}`,
      priceCurrency: product.currency,
      price:
        (product.hasDiscount ? product.salePriceCents : product.priceCents) ??
        product.priceCents,
      availability: product.isSoldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
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

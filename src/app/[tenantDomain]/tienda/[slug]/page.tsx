import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { ProductGallery } from '@/modules/Store/presentation/ProductGallery';
import { mediaSrc } from '@/shared/lib/mediaSrc';
import { AddToCartForm } from '@/modules/Store/presentation/AddToCartForm';
import { ProductJsonLd } from '@/modules/Store/presentation/ProductJsonLd';
import { canonical, NO_INDEX } from '@/shared/lib/seo';

/**
 * Direcciones estables para la galería. La URL firmada sirve de respaldo mientras la API no
 * mande las claves (ver web-builder-api#87); así la ficha no se queda sin imágenes entre un
 * despliegue y el otro.
 */
const galleryImages = (product: {
  imageKeys?: readonly string[];
  imageUrls: readonly string[];
}): string[] =>
  product.imageKeys === undefined || product.imageKeys.length === 0
    ? [...product.imageUrls]
    : product.imageKeys.flatMap((key) => {
        const src = mediaSrc(key);
        return src === null ? [] : [src];
      });

interface StoreProductPageProps {
  readonly params: Promise<{ tenantDomain: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: StoreProductPageProps): Promise<Metadata> {
  const { tenantDomain, slug } = await params;
  const product = await createStoreService(tenantDomain).getProduct(slug);
  if (product === null) {
    return { title: 'Producto no encontrado', robots: NO_INDEX };
  }

  const image = product.imageUrls[0];

  return {
    title: product.name,
    description: product.description,
    alternates: canonical(`/tienda/${slug}`),
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: image === undefined ? undefined : [{ url: image }],
    },
    twitter: {
      card: image === undefined ? 'summary' : 'summary_large_image',
      title: product.name,
      description: product.description,
      images: image === undefined ? undefined : [image],
    },
  };
}

export default async function StoreProductPage({
  params,
}: StoreProductPageProps): Promise<ReactElement> {
  const { tenantDomain, slug } = await params;
  const storeService = createStoreService(tenantDomain);

  const [store, product, settings] = await Promise.all([
    storeService.getStoreSettings(),
    storeService.getProduct(slug),
    createGlobalSettingsService(tenantDomain).getSettings(),
  ]);

  if (store === null || product === null) {
    notFound();
  }

  const siteUrl = `https://${settings.primaryDomain ?? tenantDomain}`;

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <ProductJsonLd product={product} siteUrl={siteUrl} />

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={galleryImages(product)} alt={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="ui-heading text-3xl md:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold">{product.price}</span>
              {product.hasDiscount && product.salePrice !== null && (
                <span className="text-muted-foreground text-lg line-through">
                  {product.salePrice}
                </span>
              )}
              {product.isSoldOut && (
                <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-semibold">
                  Agotado
                </span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <AddToCartForm product={product} />
        </div>
      </div>
    </article>
  );
}

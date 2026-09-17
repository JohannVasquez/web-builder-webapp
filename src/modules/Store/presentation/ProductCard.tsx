import Link from 'next/link';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { imageLoading } from '@/shared/lib/imageLoading';
import type { ProductView } from '../domain/Product';

interface ProductCardProps {
  readonly product: ProductView;
  readonly lightText?: boolean;
}

// Tarjeta de un producto, compartida entre el catálogo (`/tienda`) y el bloque "Productos
// destacados", igual que `BlogPostCard` hace con el blog y su bloque "Últimas publicaciones".
export function ProductCard({
  product,
  lightText = false,
}: ProductCardProps): ReactElement {
  const image = product.imageUrls[0];

  return (
    <Link
      href={`/tienda/${product.slug}`}
      className="ui-card group flex flex-col overflow-hidden p-0"
    >
      <div className="bg-muted relative aspect-square w-full overflow-hidden">
        {image !== undefined && (
          // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform group-hover:scale-105"
            {...imageLoading()}
          />
        )}
        {product.isSoldOut && (
          <span className="bg-foreground text-background absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold">
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3
          className={cn(
            'text-lg font-semibold group-hover:underline',
            lightText && 'text-white',
          )}
        >
          {product.name}
        </h3>
        <p
          className={cn(
            'line-clamp-2 text-sm',
            lightText ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {product.description}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold">{product.price}</span>
          {product.hasDiscount && product.salePrice !== null && (
            <span
              className={cn(
                'text-sm line-through',
                lightText ? 'text-white/60' : 'text-muted-foreground',
              )}
            >
              {product.salePrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

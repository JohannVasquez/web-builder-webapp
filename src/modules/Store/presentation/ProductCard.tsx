import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { mediaSrc } from '@/shared/lib/mediaSrc';
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
  // La clave da una dirección estable; la URL firmada es el respaldo mientras la API no la
  // mande (ver `mediaSrc`).
  const image = mediaSrc(product.imageKeys?.[0]) ?? product.imageUrls[0] ?? null;

  return (
    <Link
      href={`/tienda/${product.slug}`}
      className="ui-card group flex flex-col overflow-hidden p-0"
    >
      <div className="bg-muted relative aspect-square w-full overflow-hidden">
        {image !== null && (
          // `fill` porque el contenedor ya reserva el espacio con `aspect-square`: la imagen
          // no tiene que traer sus dimensiones para que no haya salto de maquetación.
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
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

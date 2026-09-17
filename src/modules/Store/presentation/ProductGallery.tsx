'use client';

import { useState, type ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { imageLoading } from '@/shared/lib/imageLoading';

interface ProductGalleryProps {
  readonly images: readonly string[];
  readonly alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="bg-muted aspect-square w-full rounded-2xl" />;
  }

  const activeImage = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted aspect-square w-full overflow-hidden rounded-2xl">
        {
          // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
          <img
            src={activeImage}
            alt={alt}
            className="size-full object-cover"
            {...imageLoading(true)}
          />
        }
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === activeIndex}
              className={cn(
                'bg-muted aspect-square overflow-hidden rounded-lg ring-2 ring-transparent transition',
                index === activeIndex && 'ring-primary',
              )}
            >
              {
                // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
                <img
                  src={image}
                  alt=""
                  className="size-full object-cover"
                  {...imageLoading()}
                />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

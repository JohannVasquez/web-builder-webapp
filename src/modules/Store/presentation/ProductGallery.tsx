'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';

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
      <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-2xl">
        {/* `priority`: es la imagen principal de la ficha, sobre el pliegue. Diferirla
            empeora el LCP en vez de mejorarlo. */}
        <Image
          src={activeImage}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
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
                'bg-muted relative aspect-square overflow-hidden rounded-lg ring-2 ring-transparent transition',
                index === activeIndex && 'ring-primary',
              )}
            >
              <Image src={image} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

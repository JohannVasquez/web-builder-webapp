'use client';

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface RevealOnScrollProps {
  readonly animation: 'none' | 'fade' | 'slide';
  readonly className?: string;
  readonly children: ReactNode;
}

const ANIMATION_CLASS: Readonly<Record<'fade' | 'slide', string>> = {
  fade: 'reveal-fade',
  slide: 'reveal-slide',
};

const INTERSECTION_THRESHOLD = 0.15;

// El estado inicial oculto lo decide el CSS, no este componente: la regla solo aplica bajo
// `[data-js='on']`, que el script de tema marca antes del primer pintado y solo si hay
// IntersectionObserver. Así nunca queda contenido escondido sin nadie que lo revele.
export function RevealOnScroll({
  animation,
  className,
  children,
}: RevealOnScrollProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (animation === 'none') {
      return;
    }
    const node = ref.current;
    if (node === null || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting === true) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: INTERSECTION_THRESHOLD },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [animation]);

  if (animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn(className, ANIMATION_CLASS[animation])}
      data-revealed={revealed}
    >
      {children}
    </div>
  );
}

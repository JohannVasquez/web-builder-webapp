import type { ReactElement } from 'react';
import { sellerLines, type SellerIdentity } from '../domain/StoreSettings';

interface SellerIdentityCardProps {
  readonly seller: SellerIdentity | undefined;
  readonly variant?: 'footer' | 'checkout';
}

/**
 * Quién vende. El Reglamento de Comercio Electrónico lo exige visible: sin razón social ni
 * RUT, quien compra no sabe a quién reclamarle ni a quién exigirle la boleta.
 *
 * Si no hay datos cargados no se pinta nada. La validación que impide encender una tienda
 * incompleta vive en la API (ver web-builder-api#77); aquí no se inventan huecos.
 */
export function SellerIdentityCard({
  seller,
  variant = 'footer',
}: SellerIdentityCardProps): ReactElement | null {
  const lines = sellerLines(seller);
  if (lines.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Datos del vendedor"
      className={
        variant === 'checkout'
          ? 'ui-card text-muted-foreground space-y-1 p-4 text-sm'
          : 'text-muted-foreground space-y-1 text-xs'
      }
    >
      <p className="text-foreground font-semibold">Vendido por</p>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

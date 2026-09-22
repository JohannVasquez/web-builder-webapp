'use client';

import type { Product, ProductCategory } from '../domain/StoreApi';
import { formatMoney } from '../application/storePresentation';
import { Button } from '@/shared/ui/button';
import { Edit, Trash2 } from 'lucide-react';

export interface ProductListProps {
  readonly products: readonly Product[];
  readonly categories: readonly ProductCategory[];
  readonly onEdit: (product: Product) => void;
  readonly onDelete: (product: Product) => void;
}

export const ProductList = ({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductListProps): import('react').ReactElement | null => {
  const getCategoryName = (id: string | null): string => {
    if (id === null) return 'Sin categoría';
    return categories.find((c) => c.id === id)?.name ?? 'Desconocida';
  };

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <p className="text-muted-foreground">No hay productos creados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`border rounded-lg p-4 flex flex-col gap-2 ${!p.isActive ? 'opacity-60 bg-muted/50' : 'bg-card'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg leading-tight">{p.name}</h4>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(p)}
                    title="Editar"
                    aria-label={`Editar ${p.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(p)}
                    title="Eliminar"
                    aria-label={`Eliminar ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground flex gap-2 flex-wrap">
                <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                  {getCategoryName(p.categoryId)}
                </span>
                {!p.isActive && (
                  <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs font-medium">
                    Inactivo
                  </span>
                )}
                {p.featured && (
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full text-xs font-medium">
                    Destacado
                  </span>
                )}
                {p.isSoldOut && (
                  <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                    Agotado
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 flex justify-between items-end">
                <div>
                  {p.salePriceCents !== null ? (
                    <div className="flex flex-col">
                      <span className="text-xs line-through text-muted-foreground">
                        {formatMoney(p.priceCents, p.currency)}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(p.salePriceCents, p.currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold">
                      {formatMoney(p.priceCents, p.currency)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {p.stock === null ? 'Stock ∞' : `Stock: ${p.stock}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

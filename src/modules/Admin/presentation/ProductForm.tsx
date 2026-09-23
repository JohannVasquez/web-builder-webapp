'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { refreshAsyncData } from '@/shared/lib/useAsyncData';
import { describeAdminError } from '../application/adminErrorMessage';
import { proposeSlug, isValidSalePrice } from '../application/storePresentation';
import {
  ProductResponseSchema,
  type Product,
  type ProductCategory,
  type ProductVariant,
} from '../domain/StoreApi';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

export interface ProductFormProps {
  readonly tenantId: string;
  readonly product: Product | null;
  readonly categories: readonly ProductCategory[];
  readonly onClose: () => void;
}

const PRODUCTS_CACHE_KEY = (tenantId: string): string => `admin:products:${tenantId}`;

export function ProductForm({
  tenantId,
  product,
  categories,
  onClose,
}: ProductFormProps): ReactElement {
  const api = useAdminApi();
  const isEditing = product !== null;

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [description, setDescription] = useState(product?.description ?? '');
  const [priceCents, setPriceCents] = useState(product?.priceCents.toString() ?? '');
  const [salePriceCents, setSalePriceCents] = useState(
    product?.salePriceCents?.toString() ?? '',
  );
  const [categoryId, setCategoryId] = useState<string>(
    product?.categoryId?.toString() ?? '',
  );
  const [variants, setVariants] = useState<readonly ProductVariant[]>(
    product?.variants ?? [],
  );
  const [stock, setStock] = useState(product?.stock?.toString() ?? '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [position, setPosition] = useState(product?.position?.toString() ?? '0');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChangeName = (newName: string): void => {
    setName(newName);
    if (!slugEdited && !isEditing) {
      setSlug(proposeSlug(newName));
    }
  };

  const handleAddVariant = (): void => {
    setVariants([...variants, { name: '', options: [] }]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string,
  ): void => {
    const next = [...variants];
    const item = next[index];
    if (item !== undefined) {
      if (field === 'options') {
        item.options = value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else {
        item.name = value;
      }
      next[index] = item;
      setVariants(next);
    }
  };

  const handleRemoveVariant = (index: number): void => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const price = parseInt(priceCents, 10);
    if (isNaN(price)) {
      setFormError('El precio debe ser un número entero.');
      return;
    }

    const salePrice = salePriceCents === '' ? null : parseInt(salePriceCents, 10);
    if (salePrice !== null && isNaN(salePrice)) {
      setFormError('El precio de oferta debe ser un número entero o vacío.');
      return;
    }

    if (!isValidSalePrice(price, salePrice)) {
      setFormError('El precio de oferta debe ser menor que el precio normal.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      slug,
      description,
      priceCents: price,
      salePriceCents: salePrice,
      categoryId: categoryId === '' ? null : parseInt(categoryId, 10),
      variants,
      stock: stock === '' ? null : parseInt(stock, 10),
      isActive,
      featured,
      position: parseInt(position, 10) || 0,
    };

    try {
      if (isEditing) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/products/${product.id}`,
          payload,
          ProductResponseSchema,
        );
        toast.success('Producto actualizado.');
      } else {
        await api.post(
          `/api/admin/tenants/${tenantId}/products`,
          payload,
          ProductResponseSchema,
        );
        toast.success('Producto creado.');
      }
      refreshAsyncData(PRODUCTS_CACHE_KEY(tenantId));
      onClose();
    } catch (err) {
      const errorData = describeAdminError(err, 'Error al guardar el producto.');
      setFormError(
        errorData.message +
          (errorData.issues.length > 0
            ? ': ' + errorData.issues.map((i) => i.message).join(', ')
            : ''),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-lg border shadow-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Producto' : 'Crear Producto'}
          </h2>
          <Button aria-label="Cerrar el formulario del producto" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            ✕
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="p-4 overflow-y-auto space-y-4"
        >
          {formError !== null && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleChangeName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Dirección (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceCents">Precio normal (Ej: 29990 = $29.990)</Label>
              <Input
                id="priceCents"
                type="number"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePriceCents">Precio de oferta (opcional)</Label>
              <Input
                id="salePriceCents"
                type="number"
                value={salePriceCents}
                onChange={(e) => setSalePriceCents(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock (0 = agotado, vacío = sin límite)</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border p-3 rounded-md">
            <div className="flex items-center justify-between">
              <Label>Variantes (Tallas, Colores, etc.)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
              >
                <Plus className="size-4 mr-1" /> Agregar
              </Button>
            </div>
            {variants.map((variant, i) => (
              <div key={i} className="flex items-start gap-2 mt-2">
                <Input
                  placeholder="Nombre (ej: Talla)"
                  aria-label={`Nombre de la variante ${String(i + 1)}`}
                  value={variant.name}
                  onChange={(e) => handleUpdateVariant(i, 'name', e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="Opciones (S, M, L)"
                  aria-label={`Opciones de la variante ${String(i + 1)}, separadas por coma`}
                  value={variant.options.join(', ')}
                  onChange={(e) => handleUpdateVariant(i, 'options', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVariant(i)}
                  aria-label={`Quitar la variante ${String(i + 1)}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Orden (0 = primero)</Label>
              <Input
                id="position"
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

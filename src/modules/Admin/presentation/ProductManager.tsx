'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { proposeSlug } from '../application/storePresentation';
import {
  ProductListResponseSchema,
  ProductCategoryListResponseSchema,
  ProductCategoryResponseSchema,
  type Product,
  type ProductCategory,
} from '../domain/StoreApi';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export interface ProductManagerProps {
  readonly tenantId: number;
}

const PRODUCTS_CACHE_KEY = (tenantId: number): string => `admin:products:${tenantId}`;
const CATEGORIES_CACHE_KEY = (tenantId: number): string => `admin:categories:${tenantId}`;

export const ProductManager = ({
  tenantId,
}: ProductManagerProps): import('react').ReactElement | null => {
  const api = useAdminApi();

  const productsState = useAsyncData(PRODUCTS_CACHE_KEY(tenantId), () =>
    api.get(`/api/admin/tenants/${tenantId}/products`, ProductListResponseSchema),
  );

  const categoriesState = useAsyncData(CATEGORIES_CACHE_KEY(tenantId), () =>
    api.get(
      `/api/admin/tenants/${tenantId}/products/categories`,
      ProductCategoryListResponseSchema,
    ),
  );

  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    product: Product | null;
  } | null>(null);

  // Category form state
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const isLoading = productsState.isLoading || categoriesState.isLoading;
  const error = productsState.error ?? categoriesState.error;

  const handleDeleteProduct = async (product: Product): Promise<void> => {
    if (!window.confirm(`¿Seguro que deseas eliminar el producto "${product.name}"?`)) {
      return;
    }
    setSaving(true);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/products/${product.id}`);
      toast.success('Producto eliminado.');
      refreshAsyncData(PRODUCTS_CACHE_KEY(tenantId));
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al eliminar producto.').message);
    } finally {
      setSaving(false);
    }
  };

  const openCategoryForm = (category: ProductCategory | null): void => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setCategoryFormOpen(true);
  };

  const handleSaveCategory = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/products/categories/${editingCategory.id}`,
          { name: categoryName, slug: proposeSlug(categoryName) },
          ProductCategoryResponseSchema,
        );
        toast.success('Categoría renombrada.');
      } else {
        await api.post(
          `/api/admin/tenants/${tenantId}/products/categories`,
          { name: categoryName, slug: proposeSlug(categoryName) },
          ProductCategoryResponseSchema,
        );
        toast.success('Categoría creada.');
      }
      refreshAsyncData(CATEGORIES_CACHE_KEY(tenantId));
      setCategoryFormOpen(false);
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al guardar categoría.').message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: ProductCategory): Promise<void> => {
    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"?`)) {
      return;
    }
    setSaving(true);
    try {
      await api.remove(
        `/api/admin/tenants/${tenantId}/products/categories/${category.id}`,
      );
      toast.success('Categoría eliminada.');
      refreshAsyncData(CATEGORIES_CACHE_KEY(tenantId));
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al eliminar categoría.').message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !productsState.data || !categoriesState.data) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        {error ?? 'Error al cargar productos.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Productos</h3>
          <Button
            onClick={() => setEditingProduct({ id: 'new', product: null })}
            disabled={saving}
          >
            <Plus className="mr-2 h-4 w-4" /> Crear Producto
          </Button>
        </div>

        <ProductList
          products={productsState.data.products}
          categories={categoriesState.data.categories}
          onEdit={(product) => setEditingProduct({ id: product.id.toString(), product })}
          onDelete={(product) => {
            void handleDeleteProduct(product);
          }}
        />
      </div>

      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Categorías</h3>
          <Button
            onClick={() => openCategoryForm(null)}
            variant="outline"
            disabled={saving || categoryFormOpen}
          >
            <Plus className="mr-2 h-4 w-4" /> Crear Categoría
          </Button>
        </div>

        {categoryFormOpen && (
          <form
            onSubmit={(e) => {
              void handleSaveCategory(e);
            }}
            className="border p-4 rounded-md bg-card flex items-end gap-4"
          >
            <div className="space-y-2 flex-1">
              <Label htmlFor="categoryName">Nombre de la categoría</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCategoryFormOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
          </form>
        )}

        {categoriesState.data.categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay categorías creadas.</p>
        ) : (
          <div className="border rounded-md divide-y">
            {categoriesState.data.categories.map((category) => (
              <div
                key={category.id}
                className="p-3 flex items-center justify-between bg-card"
              >
                <div>
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    /{category.slug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openCategoryForm(category)}
                    disabled={saving || categoryFormOpen}
                    aria-label={`Renombrar la categoría ${category.name}`}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      void handleDeleteCategory(category);
                    }}
                    disabled={saving || categoryFormOpen}
                    aria-label={`Eliminar la categoría ${category.name}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProduct && (
        <ProductForm
          key={editingProduct.id}
          tenantId={tenantId}
          product={editingProduct.product}
          categories={categoriesState.data.categories}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export { ProductList } from './ProductList';

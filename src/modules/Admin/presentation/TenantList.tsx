'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { ExternalLink, Loader2, Search } from 'lucide-react';
import { TenantsSchema } from '../domain/AdminApi';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { Input } from '@/shared/ui/input';

export function TenantList(): ReactElement {
  const api = useAdminApi();
  const [query, setQuery] = useState('');
  const { data, error, isLoading } = useAsyncData('admin:tenants', async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  if (error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  }

  if (isLoading || data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando clientes...
      </p>
    );
  }

  const term = query.trim().toLowerCase();
  const visible = data.filter(
    (tenant) =>
      term === '' ||
      tenant.name.toLowerCase().includes(term) ||
      tenant.slug.toLowerCase().includes(term),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">Clientes</h1>
        <div className="relative w-full max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Buscar cliente"
            placeholder="Buscar..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">
          No hay clientes que coincidan con la búsqueda.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((tenant) => (
            <li key={tenant.id} className="ui-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/clientes/${String(tenant.id)}`}
                    className="ui-heading block truncate text-lg hover:underline"
                  >
                    {tenant.name}
                  </Link>
                  <p className="text-muted-foreground truncate text-sm">{tenant.slug}</p>
                </div>
                {tenant.primaryDomain !== null && (
                  <a
                    href={`http://${tenant.primaryDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-sm"
                  >
                    Ver sitio <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, TriangleAlert } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { describeAdminError } from '../application/adminErrorMessage';
import { AdminPagesSchema, type AdminPage } from '../domain/AdminApi';
import { z } from 'zod';

const LegalTemplateSchema = z.object({
  kind: z.enum(['privacidad', 'cookies', 'terminos', 'compra']),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
});

const LegalTemplatesResponseSchema = z.object({
  reviewNotice: z.string(),
  version: z.string(),
  legalTemplates: z.array(LegalTemplateSchema),
});

interface LegalPagesManagerProps {
  readonly tenantId: string;
}

export function LegalPagesManager({ tenantId }: LegalPagesManagerProps): ReactElement {
  const api = useAdminApi();
  const pagesKey = `admin:tenant:${tenantId}:pages`;
  const templatesKey = 'admin:legal-templates';

  const pagesData = useAsyncData(pagesKey, async () => {
    const { pages } = await api.get(`/api/admin/tenants/${tenantId}/pages`, AdminPagesSchema);
    return pages;
  });

  const templatesData = useAsyncData(templatesKey, async () => {
    const res = await api.get('/api/admin/legal-templates', LegalTemplatesResponseSchema);
    return res;
  });

  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (kind: string, existingPage?: AdminPage): Promise<void> => {
    if (existingPage !== undefined) {
      if (!window.confirm('¿Volver a generar esta página? Perderás cualquier edición que hayas hecho.')) {
        return;
      }
    }
    
    setGenerating(kind);
    try {
      // Si existe, primero la borramos para recrearla
      if (existingPage !== undefined) {
        await api.remove(`/api/admin/tenants/${tenantId}/pages/${String(existingPage.id)}`);
      }
      
      await api.post(`/api/admin/tenants/${tenantId}/legal-pages`, { kind }, z.any());
      toast.success('Página legal generada.');
      refreshAsyncData(pagesKey);
    } catch (error) {
      toast.error(describeAdminError(error, 'Error al generar la página.').message);
    } finally {
      setGenerating(null);
    }
  };

  if (pagesData.error !== null || templatesData.error !== null) {
    return <p className="text-destructive">Error cargando datos.</p>;
  }

  if (pagesData.isLoading || templatesData.isLoading || pagesData.data === null || templatesData.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando plantillas...
      </p>
    );
  }

  const { legalTemplates, reviewNotice } = templatesData.data;
  const pages = pagesData.data;

  // Extract unfilled markers: \{\{([^}]+)\}\} from section.props.content
  const getMarkers = (page: AdminPage): string[] => {
    const content = page.sections.find(s => s.type === 'TextBlock')?.props.content;
    if (typeof content !== 'string') return [];
    const matches = Array.from(content.matchAll(/\{\{([^}]+)\}\}/g));
    const markers = matches.map(m => m[1]);
    return Array.from(new Set(markers)); // Unique
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <h1 className="ui-heading text-2xl">Páginas legales</h1>
        <p className="text-muted-foreground text-sm">{reviewNotice}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {legalTemplates.map((template) => {
          const existingPage = pages.find((p) => p.slug === template.slug);
          const isGenerating = generating === template.kind;
          const markers = existingPage !== undefined ? getMarkers(existingPage) : [];

          return (
            <div key={template.kind} className="ui-card flex flex-col justify-between p-5 space-y-4">
              <div>
                <h2 className="font-semibold">{template.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
              </div>

              {existingPage !== undefined ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    {existingPage.isPublished ? (
                      <span className="text-emerald-600 font-medium">Publicada</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Borrador (sin publicar)</span>
                    )}
                  </div>
                  
                  {markers.length > 0 && (
                    <div className="bg-amber-50 text-amber-900 rounded-md p-3 text-sm">
                      <p className="font-medium flex items-center gap-2 mb-1">
                        <TriangleAlert className="size-4" />
                        Faltan datos por rellenar:
                      </p>
                      <ul className="list-disc pl-5">
                        {markers.map(m => (
                          <li key={m}><code className="bg-amber-100 px-1 rounded">{m}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm">
                      <Link href={`/clientes/${tenantId}/paginas/${String(existingPage.id)}`}>
                        Editar contenido
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={generating !== null}
                      onClick={() => void handleGenerate(template.kind, existingPage)}
                    >
                      {isGenerating && <Loader2 className="size-4 mr-2 animate-spin" />}
                      Volver a generar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={generating !== null}
                    onClick={() => void handleGenerate(template.kind)}
                  >
                    {isGenerating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Plus className="size-4 mr-2" />}
                    Generar página
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

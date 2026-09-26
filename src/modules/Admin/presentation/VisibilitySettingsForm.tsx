'use client';

import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useAdminApi } from './useAdminApi';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { GlobalSettingsSchema, type GlobalSettings } from '@/modules/GlobalSettings/domain/GlobalSettings';
import { globalSettingsSchemas } from '@/modules/GlobalSettings/domain/settingsSchemas';
import { describeAdminError, type AdminErrorMessage } from '../application/adminErrorMessage';

interface Props {
  readonly tenantId: string;
}

export function VisibilitySettingsForm({ tenantId }: Props): ReactElement {
  const api = useAdminApi();
  const [initialData, setInitialData] = useState<GlobalSettings | null>(null);
  const [draft, setDraft] = useState<Partial<GlobalSettings>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<AdminErrorMessage | null>(null);

  useEffect(() => {
    let active = true;
    void api
      .get(`/api/admin/tenants/${tenantId}/settings`, GlobalSettingsSchema)
      .then((res) => {
        if (!active) return;
        setInitialData(res);
        setDraft(res);
      })
      .catch(() => {
        if (active) toast.error('No se pudieron cargar los datos de visibilidad.');
      });
    return () => {
      active = false;
    };
  }, [api, tenantId]);

  const isDirty = initialData !== null && JSON.stringify(initialData) !== JSON.stringify({ ...initialData, ...draft });
  useUnsavedChangesGuard(isDirty);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (isSubmitting || !isDirty || !initialData) return;

    setErrorMsg(null);

    const parsed = globalSettingsSchemas.safeParse(draft);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      setErrorMsg({ message: 'Revisa los campos con errores.', issues });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.put(`/api/admin/tenants/${tenantId}/settings`, draft, GlobalSettingsSchema);
      setInitialData(result);
      setDraft(result);
      toast.success('Configuración guardada con éxito.');
    } catch (err) {
      setErrorMsg(describeAdminError(err, 'No se pudo guardar la configuración'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: keyof GlobalSettings, value: string | boolean): void => {
    const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
    setDraft((prev) => ({ ...prev, [key]: stringValue }));
  };

  if (!initialData) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getError = (key: string): string | undefined => errorMsg?.issues.find(i => i.path === key)?.message;

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-8">
      <section className="ui-card space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="ui-heading text-lg">Modo en construcción</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {draft.siteUnderConstruction === 'true' 
                ? 'El sitio web está oculto. Solo los administradores pueden verlo.'
                : 'El sitio web es público y visible para los buscadores.'}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <span className="text-sm font-medium">Activar modo en construcción</span>
            <input
              type="checkbox"
              checked={draft.siteUnderConstruction === 'true'}
              onChange={(e) => updateField('siteUnderConstruction', e.target.checked)}
              className="size-4 shrink-0 rounded-sm border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      <section className="ui-card space-y-4 p-6">
        <div>
          <h2 className="ui-heading text-lg">Medición y analítica</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Al conectar estas herramientas, el sitio mostrará automáticamente un aviso de cookies.
            Si el visitante no las acepta, no se cargarán.
          </p>
        </div>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics 4</Label>
            <Input
              id="googleAnalyticsId"
              value={draft.googleAnalyticsId ?? ''}
              onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              aria-invalid={!!getError('googleAnalyticsId')}
            />
            <p className="text-xs text-muted-foreground">
              Ingresa el ID de medición. Empieza con G- seguido de letras y números. Lo encuentras en el panel de administración de GA4.
            </p>
            {getError('googleAnalyticsId') && <p className="text-sm text-destructive">{getError('googleAnalyticsId')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaPixelId">Meta Pixel (Facebook)</Label>
            <Input
              id="metaPixelId"
              value={draft.metaPixelId ?? ''}
              onChange={(e) => updateField('metaPixelId', e.target.value)}
              placeholder="1234567890"
              aria-invalid={!!getError('metaPixelId')}
            />
            <p className="text-xs text-muted-foreground">
              Ingresa solo los números de tu ID de Pixel. Lo encuentras en el Administrador de Eventos de Meta.
            </p>
            {getError('metaPixelId') && <p className="text-sm text-destructive">{getError('metaPixelId')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleTagManagerId">Google Tag Manager</Label>
            <Input
              id="googleTagManagerId"
              value={draft.googleTagManagerId ?? ''}
              onChange={(e) => updateField('googleTagManagerId', e.target.value)}
              placeholder="GTM-XXXXXX"
              aria-invalid={!!getError('googleTagManagerId')}
            />
            <p className="text-xs text-muted-foreground">
              Úsalo solo si requieres etiquetas avanzadas. Empieza con GTM-. Si ya usas GTM, no es necesario cargar GA4 arriba.
            </p>
            {getError('googleTagManagerId') && <p className="text-sm text-destructive">{getError('googleTagManagerId')}</p>}
          </div>
        </div>
      </section>

      <section className="ui-card space-y-4 p-6">
        <div>
          <h2 className="ui-heading text-lg">Verificación en buscadores</h2>
          <p className="text-muted-foreground text-sm mt-1">
            No pegues la etiqueta HTML completa, solo el código identificador que viene dentro.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label htmlFor="googleSiteVerification">Google Search Console</Label>
            <Input
              id="googleSiteVerification"
              value={draft.googleSiteVerification ?? ''}
              onChange={(e) => updateField('googleSiteVerification', e.target.value)}
              aria-invalid={!!getError('googleSiteVerification')}
            />
            <p className="text-xs text-muted-foreground">
              El valor dentro del atributo content de la etiqueta meta proporcionada por Google.
            </p>
            {getError('googleSiteVerification') && <p className="text-sm text-destructive">{getError('googleSiteVerification')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bingSiteVerification">Bing Webmaster Tools</Label>
            <Input
              id="bingSiteVerification"
              value={draft.bingSiteVerification ?? ''}
              onChange={(e) => updateField('bingSiteVerification', e.target.value)}
              aria-invalid={!!getError('bingSiteVerification')}
            />
            <p className="text-xs text-muted-foreground">
              El código alfanumérico provisto para la verificación.
            </p>
            {getError('bingSiteVerification') && <p className="text-sm text-destructive">{getError('bingSiteVerification')}</p>}
          </div>
        </div>
      </section>

      {errorMsg && (
        <div role="alert" className="text-destructive space-y-1 text-sm bg-destructive/10 p-4 rounded-md">
          <p className="font-semibold">{errorMsg.message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pb-8">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />} Guardar configuración
        </Button>
        {isDirty && (
          <span className="text-muted-foreground text-sm">Tienes cambios sin guardar.</span>
        )}
      </div>
    </form>
  );
}

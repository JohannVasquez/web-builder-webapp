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
import { OpeningHoursInput } from './OpeningHoursInput';

interface Props {
  readonly tenantId: string;
}

export function BusinessSettingsForm({ tenantId }: Props): ReactElement {
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
        if (active) toast.error('No se pudieron cargar los datos del negocio.');
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

    // Client-side validation for the fields being sent
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
      toast.success('Datos del negocio guardados con éxito.');
    } catch (err) {
      setErrorMsg(describeAdminError(err, 'No se pudieron guardar los datos'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: keyof GlobalSettings, value: string): void => {
    setDraft((prev) => ({ ...prev, [key]: value }));
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
        <h2 className="ui-heading text-lg">Información general</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nombre del sitio</Label>
            <Input
              id="siteName"
              value={draft.siteName ?? ''}
              onChange={(e) => updateField('siteName', e.target.value)}
              aria-invalid={!!getError('siteName')}
            />
            {getError('siteName') && <p className="text-sm text-destructive">{getError('siteName')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Eslogan o descripción breve</Label>
            <Input
              id="tagline"
              value={draft.tagline ?? ''}
              onChange={(e) => updateField('tagline', e.target.value)}
              aria-invalid={!!getError('tagline')}
            />
            {getError('tagline') && <p className="text-sm text-destructive">{getError('tagline')}</p>}
          </div>
        </div>
      </section>

      <section className="ui-card space-y-4 p-6">
        <h2 className="ui-heading text-lg">Contacto y ubicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Correo de contacto</Label>
            <Input
              id="contactEmail"
              value={draft.contactEmail ?? ''}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="contacto@ejemplo.cl, ventas@ejemplo.cl"
              aria-invalid={!!getError('contactEmail')}
            />
            <p className="text-xs text-muted-foreground">Puedes ingresar varias direcciones separadas por coma.</p>
            {getError('contactEmail') && <p className="text-sm text-destructive">{getError('contactEmail')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Teléfono general</Label>
            <Input
              id="contactPhone"
              value={draft.contactPhone ?? ''}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              aria-invalid={!!getError('contactPhone')}
            />
            {getError('contactPhone') && <p className="text-sm text-destructive">{getError('contactPhone')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
            <Input
              id="whatsappNumber"
              value={draft.whatsappNumber ?? ''}
              onChange={(e) => updateField('whatsappNumber', e.target.value)}
              placeholder="+56 9 1234 5678"
              aria-invalid={!!getError('whatsappNumber')}
            />
            <p className="text-xs text-muted-foreground">Este número se usará para el botón flotante.</p>
            {getError('whatsappNumber') && <p className="text-sm text-destructive">{getError('whatsappNumber')}</p>}
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección física</Label>
            <Input
              id="address"
              value={draft.address ?? ''}
              onChange={(e) => updateField('address', e.target.value)}
              aria-invalid={!!getError('address')}
            />
            {getError('address') && <p className="text-sm text-destructive">{getError('address')}</p>}
          </div>
        </div>
      </section>

      <section className="ui-card space-y-4 p-6">
        <h2 className="ui-heading text-lg">Horarios de atención</h2>
        <div className="space-y-2">
          <OpeningHoursInput 
            value={draft.openingHours ?? ''} 
            onChange={(val) => updateField('openingHours', val)} 
          />
          {getError('openingHours') && <p className="text-sm text-destructive">{getError('openingHours')}</p>}
        </div>
      </section>

      <section className="ui-card space-y-4 p-6">
        <h2 className="ui-heading text-lg">Redes sociales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: 'instagramUrl', label: 'Instagram' },
            { id: 'facebookUrl', label: 'Facebook' },
            { id: 'tiktokUrl', label: 'TikTok' },
            { id: 'linkedinUrl', label: 'LinkedIn' },
            { id: 'youtubeUrl', label: 'YouTube' },
            { id: 'xUrl', label: 'X (Twitter)' },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type="url"
                value={(draft[field.id as keyof GlobalSettings] as string) ?? ''}
                onChange={(e) => updateField(field.id as keyof GlobalSettings, e.target.value)}
                placeholder="https://..."
                aria-invalid={!!getError(field.id)}
              />
              {getError(field.id) && <p className="text-sm text-destructive">{getError(field.id)}</p>}
            </div>
          ))}
          <div className="space-y-2 sm:col-span-2 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Enlace personalizado extra</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customLinkLabel">Etiqueta del enlace</Label>
                <Input
                  id="customLinkLabel"
                  value={draft.customLinkLabel ?? ''}
                  onChange={(e) => updateField('customLinkLabel', e.target.value)}
                  placeholder="Ej: Reserva tu hora"
                  aria-invalid={!!getError('customLinkLabel')}
                />
                {getError('customLinkLabel') && <p className="text-sm text-destructive">{getError('customLinkLabel')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customLinkUrl">URL del enlace</Label>
                <Input
                  id="customLinkUrl"
                  type="url"
                  value={draft.customLinkUrl ?? ''}
                  onChange={(e) => updateField('customLinkUrl', e.target.value)}
                  placeholder="https://..."
                  aria-invalid={!!getError('customLinkUrl')}
                />
                {getError('customLinkUrl') && <p className="text-sm text-destructive">{getError('customLinkUrl')}</p>}
              </div>
            </div>
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
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />} Guardar cambios
        </Button>
        {isDirty && (
          <span className="text-muted-foreground text-sm">Tienes cambios sin guardar.</span>
        )}
      </div>
    </form>
  );
}

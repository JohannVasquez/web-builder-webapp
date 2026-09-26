'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { SiteTemplatesSchema, TenantsSchema } from '../domain/AdminApi';
import { CreateDemoResponseSchema, type CreateDemoResponse } from '../domain/DemoApi';
import { AdminApiError } from '../application/AdminApiClient';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  EMPTY_PROSPECT_FORM,
  buildCreateDemoPayload,
  validateCreateDemoForm,
  type ExistingProspect,
  type FormProblem,
  type ProspectFormValues,
} from '../application/demoForm';
import { demoAddressPreview } from '../application/demoPresentation';
import { proposeSlug, type CreateTenantMode } from '../application/tenantForm';
import { TENANTS_CACHE_KEY, refreshTenantLists } from '../application/tenantCache';
import { refreshDemoData } from '../application/demoCache';
import { useAdminApi } from './useAdminApi';
import { ProspectFields } from './ProspectFields';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const SITE_TEMPLATES_CACHE_KEY = 'admin:site-templates';

// Nombres de campo de la API → etiqueta del formulario, para los errores de validación.
const FIELD_LABELS: Record<string, string> = {
  slug: 'Dirección',
  name: 'Nombre del sitio',
  templateId: 'Kit por rubro',
  duplicateFromTenantId: 'Sitio a duplicar',
  'prospect.businessName': 'Negocio',
  'prospect.contactName': 'Contacto',
  'prospect.phone': 'Teléfono',
  'prospect.email': 'Correo',
  'prospect.industry': 'Rubro',
  'prospect.source': 'Origen',
  'prospect.notes': 'Notas',
};

export interface CreateDemoFormProps {
  readonly platformDomain: string;
  // Con prospecto, es una propuesta más para un negocio que ya tiene ficha.
  readonly existingProspect: ExistingProspect | null;
  readonly onCreated: (created: CreateDemoResponse) => void;
  readonly onCancel: () => void;
}

export function CreateDemoForm({
  platformDomain,
  existingProspect,
  onCreated,
  onCancel,
}: CreateDemoFormProps): ReactElement {
  const api = useAdminApi();
  const [prospect, setProspect] = useState<ProspectFormValues>(EMPTY_PROSPECT_FORM);
  const [slug, setSlug] = useState(() =>
    existingProspect === null ? '' : proposeSlug(existingProspect.businessName),
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [mode, setMode] = useState<CreateTenantMode>('template');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [duplicateFromTenantId, setDuplicateFromTenantId] = useState<string | null>(null);
  const [problem, setProblem] = useState<FormProblem | null>(null);
  const [issues, setIssues] = useState<readonly { path: string; message: string }[]>([]);
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProspectChange = (values: ProspectFormValues): void => {
    setProspect(values);
    if (!slugTouched) {
      setSlug(proposeSlug(values.businessName));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIssues([]);
    setSuggestedSlug(null);
    const values = { prospect, slug, mode, templateId, duplicateFromTenantId };
    const invalid = validateCreateDemoForm(values, existingProspect);
    setProblem(invalid);
    if (invalid !== null) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.post(
        '/api/admin/demos',
        buildCreateDemoPayload(values, existingProspect),
        CreateDemoResponseSchema,
      );
      refreshDemoData();
      refreshTenantLists();
      toast.success('Demo creada.');
      onCreated(created);
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.suggestedSlug !== null) {
        setSuggestedSlug(cause.suggestedSlug);
      }
      const described = describeAdminError(
        cause,
        'No pudimos crear la demo. Inténtalo nuevamente.',
      );
      setProblem({ field: null, message: described.message });
      setIssues(described.issues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySuggestion = (value: string): void => {
    setSlug(value);
    setSlugTouched(true);
    setSuggestedSlug(null);
    setProblem(null);
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card space-y-6 p-4 sm:p-6"
      noValidate
      aria-label={
        existingProspect === null
          ? 'Nueva demo'
          : `Nueva propuesta para ${existingProspect.businessName}`
      }
    >
      {existingProspect === null ? (
        <fieldset className="space-y-4">
          <legend className="ui-heading mb-2 text-lg">Prospecto</legend>
          <ProspectFields
            idPrefix="new-demo"
            values={prospect}
            invalidField={problem?.field ?? null}
            onChange={handleProspectChange}
          />
        </fieldset>
      ) : (
        <p className="text-muted-foreground text-sm">
          Otra propuesta de diseño para{' '}
          <strong className="text-foreground">{existingProspect.businessName}</strong>.
          Usa la misma ficha del prospecto, con otra dirección.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-demo-slug">Dirección</Label>
        <Input
          id="new-demo-slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="pasteleria-luna"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={problem?.field === 'slug' || suggestedSlug !== null}
          aria-describedby="new-demo-slug-preview"
        />
        <p id="new-demo-slug-preview" className="text-muted-foreground text-sm break-all">
          El prospecto la verá en{' '}
          <span className="text-foreground font-mono">
            {demoAddressPreview(slug, platformDomain)}
          </span>
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Punto de partida</legend>
        <StartOption
          checked={mode === 'template'}
          onSelect={() => setMode('template')}
          title="Kit por rubro"
          description="Textos, secciones y colores de inicio para ese rubro."
        />
        {mode === 'template' && (
          <TemplateSelect
            value={templateId}
            onChange={setTemplateId}
            isInvalid={problem?.field === 'templateId'}
          />
        )}
        <StartOption
          checked={mode === 'duplicate'}
          onSelect={() => setMode('duplicate')}
          title="Duplicar un sitio"
          description="Copia el sitio de un cliente; todas las páginas quedan visibles para el prospecto."
        />
        {mode === 'duplicate' && (
          <DuplicateSelect
            value={duplicateFromTenantId}
            onChange={setDuplicateFromTenantId}
            isInvalid={problem?.field === 'duplicateFromTenantId'}
          />
        )}
        <StartOption
          checked={mode === 'empty'}
          onSelect={() => setMode('empty')}
          title="Vacía"
          description="Sin páginas: se arma desde cero (o con el agente)."
        />
      </fieldset>

      {problem !== null && (
        <div role="alert" className="text-destructive space-y-2 text-sm">
          <p>{problem.message}</p>
          {issues.length > 0 && (
            <ul className="list-disc pl-5">
              {issues.map((issue) => (
                <li key={issue.path}>
                  {FIELD_LABELS[issue.path] ?? issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}
          {suggestedSlug !== null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applySuggestion(suggestedSlug)}
            >
              Usar «{suggestedSlug}»
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Crear demo
        </Button>
      </div>
    </form>
  );
}

function StartOption({
  checked,
  onSelect,
  title,
  description,
}: {
  readonly checked: boolean;
  readonly onSelect: () => void;
  readonly title: string;
  readonly description: string;
}): ReactElement {
  return (
    <label className="ui-input has-[:checked]:border-primary flex cursor-pointer items-start gap-3 p-3 text-sm">
      <input
        type="radio"
        name="demo-start"
        checked={checked}
        onChange={onSelect}
        className="mt-1 size-4"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-muted-foreground text-xs">{description}</span>
      </span>
    </label>
  );
}

interface SourceSelectProps {
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  readonly isInvalid: boolean;
}

// Un `<select>` nativo y no una lista de radios: en el celular abre el selector del sistema,
// que es lo más cómodo con el pulgar.
function TemplateSelect({ value, onChange, isInvalid }: SourceSelectProps): ReactElement {
  const api = useAdminApi();
  const templates = useAsyncData(SITE_TEMPLATES_CACHE_KEY, async () => {
    const { templates: list } = await api.get(
      '/api/admin/site-templates',
      SiteTemplatesSchema,
    );
    return list;
  });

  if (templates.error !== null) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {templates.error}
      </p>
    );
  }
  if (templates.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Cargando kits...
      </p>
    );
  }
  return (
    <div className="space-y-1 pl-1">
      <Label htmlFor="new-demo-template">Kit por rubro</Label>
      <select
        id="new-demo-template"
        className="ui-input h-10 w-full px-2 text-base sm:text-sm"
        value={value ?? ''}
        aria-invalid={isInvalid}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : event.target.value)
        }
      >
        <option value="">Elige un kit…</option>
        {templates.data.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label} · {template.pageCount}{' '}
            {template.pageCount === 1 ? 'página' : 'páginas'}
          </option>
        ))}
      </select>
    </div>
  );
}

function DuplicateSelect({
  value,
  onChange,
  isInvalid,
}: SourceSelectProps): ReactElement {
  const api = useAdminApi();
  const tenants = useAsyncData(TENANTS_CACHE_KEY, async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  if (tenants.error !== null) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {tenants.error}
      </p>
    );
  }
  if (tenants.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Cargando sitios...
      </p>
    );
  }
  return (
    <div className="space-y-1 pl-1">
      <Label htmlFor="new-demo-duplicate">Sitio a duplicar</Label>
      <select
        id="new-demo-duplicate"
        className="ui-input h-10 w-full px-2 text-base sm:text-sm"
        value={value ?? ''}
        aria-invalid={isInvalid}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : event.target.value)
        }
      >
        <option value="">Elige un sitio…</option>
        {tenants.data.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}

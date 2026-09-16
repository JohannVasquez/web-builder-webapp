'use client';

import Link from 'next/link';
import {
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import {
  BrandResponseSchema,
  CatalogSchema,
  FontPairingsSchema,
  type CatalogVisualStyle,
  type FontPairing,
} from '../domain/AdminApi';
import {
  describeAdminError,
  type AdminErrorMessage,
} from '../application/adminErrorMessage';
import {
  buildBrandPatch,
  findLowContrastPairs,
  hasBrandChanges,
  normalizeHexInput,
} from '../application/brandForm';
import { useAdminApi } from './useAdminApi';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  COLOR_MODES,
  TEXT_SCALES,
  type Brand,
  type BrandPalette,
  type ColorMode,
  type TextScale,
} from '@/modules/Brand/domain/Brand';
import { resolveBrandTheme, textScaleTokens } from '@/modules/Brand/domain/theme';
import { findVisualStyle } from '@/modules/VisualStyle/domain/registry';

interface BrandEditorProps {
  readonly tenantId: string;
}

export function BrandEditor({ tenantId }: BrandEditorProps): ReactElement {
  const api = useAdminApi();
  const brandKey = `admin:tenant:${tenantId}:brand`;

  const brand = useAsyncData(brandKey, async () => {
    const { brand: loaded } = await api.get(
      `/api/admin/tenants/${tenantId}/brand`,
      BrandResponseSchema,
    );
    return loaded;
  });
  const fontPairings = useAsyncData('admin:font-pairings', async () => {
    const { fontPairings: list } = await api.get(
      '/api/admin/font-pairings',
      FontPairingsSchema,
    );
    return list;
  });
  const catalog = useAsyncData('admin:catalog', () =>
    api.get('/api/admin/catalog', CatalogSchema),
  );

  const error = brand.error ?? fontPairings.error ?? catalog.error;
  if (error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  }

  if (brand.data === null || fontPairings.data === null || catalog.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando identidad de marca...
      </p>
    );
  }

  return (
    <BrandForm
      tenantId={tenantId}
      initialBrand={brand.data}
      fontPairings={fontPairings.data}
      visualStyles={catalog.data.visualStyles}
      onSaved={() => refreshAsyncData(brandKey)}
    />
  );
}

interface BrandFormProps {
  readonly tenantId: string;
  readonly initialBrand: Brand;
  readonly fontPairings: readonly FontPairing[];
  readonly visualStyles: readonly CatalogVisualStyle[];
  readonly onSaved: () => void;
}

const TEXT_SCALE_LABELS: Record<TextScale, string> = {
  compact: 'Compacto',
  normal: 'Normal',
  spacious: 'Amplio',
};

const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Según el visitante',
};

const PALETTE_FIELDS: ReadonlyArray<{ key: keyof BrandPalette; label: string }> = [
  { key: 'primary', label: 'Principal' },
  { key: 'secondary', label: 'Secundario' },
  { key: 'accent', label: 'Acento' },
  { key: 'background', label: 'Fondo' },
  { key: 'foreground', label: 'Texto' },
  { key: 'success', label: 'Éxito' },
  { key: 'warning', label: 'Advertencia' },
  { key: 'danger', label: 'Peligro' },
];

function BrandForm({
  tenantId,
  initialBrand,
  fontPairings,
  visualStyles,
  onSaved,
}: BrandFormProps): ReactElement {
  const api = useAdminApi();
  const [original, setOriginal] = useState(initialBrand);
  const [draft, setDraft] = useState(initialBrand);
  const [resetToken, setResetToken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<AdminErrorMessage | null>(null);

  const patch = buildBrandPatch(original, draft);
  const isDirty = hasBrandChanges(patch);
  useUnsavedChangesGuard(isDirty);

  const setPaletteColor = (key: keyof BrandPalette, value: string | undefined): void => {
    setDraft((prev) => {
      const nextPalette = { ...prev.palette };
      if (value === undefined) {
        delete nextPalette[key];
      } else {
        nextPalette[key] = value;
      }
      return { ...prev, palette: nextPalette };
    });
  };

  const handleBack = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Descartarlos?')) {
      event.preventDefault();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!isDirty) {
      toast.info('No hay cambios para guardar.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { brand: updated } = await api.patch(
        `/api/admin/tenants/${tenantId}/brand`,
        patch,
        BrandResponseSchema,
      );
      setOriginal(updated);
      setDraft(updated);
      setResetToken((token) => token + 1);
      onSaved();
      toast.success('Identidad de marca guardada.');
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos guardar los cambios. Inténtalo nuevamente.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const lowContrastPairs = findLowContrastPairs(draft.palette);
  const activeVisualStyle = findVisualStyle(draft.visualStyle);
  const previewMode = draft.colorMode === 'dark' ? 'dark' : 'light';
  const theme = resolveBrandTheme(draft.palette);
  const scaleTokens = textScaleTokens(draft.typography.scale);
  const previewStyle: CSSProperties = {
    ...theme[previewMode],
    ...scaleTokens,
    ...activeVisualStyle.tokens,
    ...(previewMode === 'dark' ? activeVisualStyle.darkTokens ?? {} : {}),
  } as CSSProperties;
  const activePairing = fontPairings.find((pairing) => pairing.id === draft.typography.pairing);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <h1 className="ui-heading text-2xl">Identidad de marca</h1>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8" noValidate>
        <section className="ui-card space-y-4 p-6">
          <h2 className="ui-heading text-lg">Paleta de colores</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PALETTE_FIELDS.map((field) => (
              <PaletteField
                key={`${field.key}-${resetToken}`}
                fieldKey={field.key}
                label={field.label}
                value={draft.palette[field.key]}
                onCommit={setPaletteColor}
              />
            ))}
          </div>

          {lowContrastPairs.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Algunos colores no se van a leer bien:</p>
                <ul className="list-disc pl-5">
                  {lowContrastPairs.map((pair) => (
                    <li key={pair.key}>
                      {pair.label} sobre el fondo: contraste {pair.ratio.toFixed(1)}:1 (se
                      recomienda al menos 4.5:1)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="ui-card space-y-4 p-6">
          <h2 className="ui-heading text-lg">Tipografía</h2>
          <div className="space-y-2">
            <Label htmlFor="brand-pairing">Combinación tipográfica</Label>
            <select
              id="brand-pairing"
              className="ui-input h-9 w-full px-3 text-sm"
              value={draft.typography.pairing}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  typography: { ...prev.typography, pairing: event.target.value },
                }))
              }
            >
              {fontPairings.map((pairing) => (
                <option key={pairing.id} value={pairing.id}>
                  {pairing.label}
                </option>
              ))}
            </select>
            {activePairing !== undefined && (
              <p className="text-muted-foreground text-sm">{activePairing.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-scale">Escala del texto</Label>
            <select
              id="brand-scale"
              className="ui-input h-9 w-full px-3 text-sm"
              value={draft.typography.scale}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  typography: {
                    ...prev.typography,
                    scale: event.target.value as TextScale,
                  },
                }))
              }
            >
              {TEXT_SCALES.map((scale) => (
                <option key={scale} value={scale}>
                  {TEXT_SCALE_LABELS[scale]}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="ui-card space-y-4 p-6">
          <h2 className="ui-heading text-lg">Modo de color</h2>
          <div className="space-y-2">
            <Label htmlFor="brand-color-mode">Modo</Label>
            <select
              id="brand-color-mode"
              className="ui-input h-9 w-full px-3 text-sm"
              value={draft.colorMode}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  colorMode: event.target.value as ColorMode,
                }))
              }
            >
              {COLOR_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {COLOR_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="ui-card space-y-4 p-6">
          <h2 className="ui-heading text-lg">Estilo visual</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {visualStyles.map((style) => (
              <label
                key={style.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm transition-colors ${
                  draft.visualStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="visualStyle"
                    value={style.id}
                    checked={draft.visualStyle === style.id}
                    onChange={() => setDraft((prev) => ({ ...prev, visualStyle: style.id }))}
                  />
                  {style.label}
                </span>
                <span className="text-muted-foreground">{style.description}</span>
              </label>
            ))}
          </div>
        </section>

        {formError !== null && (
          <div role="alert" className="text-destructive space-y-1 text-sm">
            <p>{formError.message}</p>
            {formError.issues.length > 0 && (
              <ul className="list-disc pl-5">
                {formError.issues.map((issue) => (
                  <li key={issue.path}>
                    {issue.path}: {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />} Guardar identidad
          </Button>
          {isDirty && (
            <span className="text-muted-foreground text-sm">Tienes cambios sin guardar.</span>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="ui-heading text-lg">Vista previa</h2>
        <div
          data-surface=""
          style={{ ...previewStyle, fontFamily: activePairing?.bodyFamily }}
          className="bg-background text-foreground rounded-lg p-6"
        >
          <div className="ui-card space-y-4 p-6">
            <h3
              className="ui-heading text-2xl"
              style={{ fontFamily: activePairing?.headingFamily }}
            >
              Así se ve un título
            </h3>
            <p className="text-sm">
              Este es un párrafo de ejemplo con el cuerpo de texto de la marca, para revisar
              cómo se leen los colores y la tipografía elegidos antes de guardar.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="ui-button bg-primary text-primary-foreground px-4 py-2 text-sm"
              >
                Botón de ejemplo
              </button>
              <input
                type="text"
                readOnly
                value="Campo de ejemplo"
                className="ui-input h-9 px-3 text-sm"
              />
            </div>
            <div className="ui-card p-4">
              <p className="text-sm font-medium">Tarjeta de ejemplo</p>
              <p className="text-muted-foreground text-sm">
                Así luce una tarjeta con el estilo visual elegido.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface PaletteFieldProps {
  readonly fieldKey: keyof BrandPalette;
  readonly label: string;
  readonly value: string | undefined;
  readonly onCommit: (key: keyof BrandPalette, value: string | undefined) => void;
}

function PaletteField({ fieldKey, label, value, onCommit }: PaletteFieldProps): ReactElement {
  const [text, setText] = useState(value ?? '');
  const normalized = normalizeHexInput(text);
  const isInvalid = text.trim() !== '' && normalized === null;
  const colorValue = normalized ?? '#ffffff';
  const inputId = `brand-color-${fieldKey}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`Selector de color para ${label}`}
          value={colorValue}
          onChange={(event) => {
            setText(event.target.value);
            onCommit(fieldKey, event.target.value);
          }}
          className="h-9 w-11 shrink-0 cursor-pointer rounded border"
        />
        <Input
          id={inputId}
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            if (next.trim() === '') {
              onCommit(fieldKey, undefined);
              return;
            }
            const parsed = normalizeHexInput(next);
            if (parsed !== null) {
              onCommit(fieldKey, parsed);
            }
          }}
          placeholder="#1d4ed8"
          aria-invalid={isInvalid}
          className="font-mono text-xs"
        />
      </div>
      {isInvalid && (
        <p className="text-destructive text-xs">Ese texto no es un color hexadecimal válido.</p>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  FileText,
  Loader2,
  Search,
  Trash2,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import {
  MediaAssetResponseSchema,
  MediaAssetsSchema,
  AdminPagesSchema,
  UploadMediaResponseSchema,
  type MediaAsset,
} from '../domain/AdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  buildMediaSearchQuery,
  formatMediaSize,
  isMissingAlt,
} from '../application/mediaPresentation';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  validateFile,
  MAX_FILE_SIZE_MB,
} from '@/modules/FileStorage/domain/FileUploadSchema';
import { ImageCropper } from '@/modules/FileStorage/presentation/ImageCropper';
import { cn } from '@/shared/lib/utils';

interface MediaLibraryProps {
  readonly onSelect?: (key: string) => void;
  readonly tenantId: string;
}

export function MediaLibrary({ tenantId, onSelect }: MediaLibraryProps): ReactElement {
  const api = useAdminApi();
  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const mediaKey = `admin:tenant:${tenantId}:media:${committedSearch}`;

  const [assetToCrop, setAssetToCrop] = useState<MediaAsset | null>(null);

  const media = useAsyncData(mediaKey, async () => {
    const { assets } = await api.get(
      `/api/admin/tenants/${tenantId}/media${buildMediaSearchQuery(committedSearch)}`,
      MediaAssetsSchema,
    );
    return assets;
  });

  const reload = (): void => refreshAsyncData(mediaKey);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setCommittedSearch(searchInput.trim());
  };

  const handleCropComplete = async (
    cropped: File,
    original: MediaAsset,
  ): Promise<void> => {
    try {
      setAssetToCrop(null);
      // El recorte no destruye el original porque `api.upload` siempre genera una `key` nueva para el archivo subido.
      const { asset } = await api.upload(
        `/api/admin/tenants/${tenantId}/media`,
        cropped,
        UploadMediaResponseSchema,
      );

      if (original.alt) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/media/${encodeURIComponent(asset.key)}`,
          { alt: original.alt },
          MediaAssetResponseSchema,
        );
      }

      toast.success('Imagen recortada guardada como un nuevo archivo.');
      reload();
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos guardar el recorte. Inténtalo nuevamente.')
          .message,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        {onSelect === undefined && <h1 className="ui-heading text-2xl">Biblioteca de imágenes</h1>}
      </div>

      <Uploader tenantId={tenantId} onUploaded={reload} />

      <form onSubmit={handleSearchSubmit} className="flex max-w-md items-end gap-2">
        <div className="grow space-y-1.5">
          <Label htmlFor="media-search">Buscar por nombre o texto alternativo</Label>
          <Input
            id="media-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ej. logo, fachada..."
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="size-4" /> Buscar
        </Button>
      </form>

      {media.error !== null && (
        <p role="alert" className="text-destructive">
          {media.error}
        </p>
      )}

      {media.error === null && (media.isLoading || media.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando imágenes...
        </p>
      )}

      {media.data !== null && media.data.length === 0 && (
        <p className="text-muted-foreground">
          {committedSearch === ''
            ? 'Todavía no hay imágenes en la biblioteca de este cliente.'
            : 'No encontramos imágenes que coincidan con esa búsqueda.'}
        </p>
      )}

      {media.data !== null && media.data.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.data.map((asset) => (
            <MediaCard
              key={asset.key}
              onSelect={onSelect ? () => onSelect(asset.key) : undefined}
              tenantId={tenantId}
              asset={asset}
              onChanged={reload}
              onCrop={setAssetToCrop}
            />
          ))}
        </ul>
      )}

      {assetToCrop !== null && assetToCrop.url !== undefined && (
        <ImageCropper
          imageSrc={assetToCrop.url}
          onCropComplete={(cropped) => void handleCropComplete(cropped, assetToCrop)}
          onSkip={() => setAssetToCrop(null)}
          onCancel={() => setAssetToCrop(null)}
        />
      )}
    </div>
  );
}

interface UploaderProps {
  readonly tenantId: string;
  readonly onUploaded: () => void;
}

function Uploader({ tenantId, onUploaded }: UploaderProps): ReactElement {
  const api = useAdminApi();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File): Promise<void> => {
    const validationError = validateFile(file);
    if (validationError !== null) {
      toast.error(validationError);
      return;
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      return;
    }

    await doUpload(file);
  };

  const doUpload = async (file: File): Promise<void> => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsUploading(true);
    try {
      await api.upload(
        `/api/admin/tenants/${tenantId}/media`,
        file,
        UploadMediaResponseSchema,
      );
      toast.success('Imagen subida. No olvides agregarle un texto alternativo.');
      onUploaded();
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos subir la imagen. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file !== undefined) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading) {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file !== undefined) {
      void handleFile(file);
    }
  };

  const openFilePicker = (): void => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={isUploading}
      />
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir imagen"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-70',
        )}
      >
        {isUploading ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Subiendo...
          </p>
        ) : (
          <>
            <Upload className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="text-sm font-medium">
              Arrastra una imagen aquí o haz clic para seleccionarla
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPEG, WebP, SVG o PDF — máximo {MAX_FILE_SIZE_MB} MB
            </p>
          </>
        )}
      </div>
      {previewUrl !== null && selectedFile !== null && (
        <ImageCropper
          imageSrc={previewUrl}
          onCropComplete={(cropped) => void doUpload(cropped)}
          onSkip={() => void doUpload(selectedFile)}
          onCancel={() => {
            setPreviewUrl(null);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}

interface MediaCardProps {
  readonly onSelect?: () => void;
  readonly tenantId: string;
  readonly asset: MediaAsset;
  readonly onChanged: () => void;
  readonly onCrop: (asset: MediaAsset) => void;
}

function MediaCard({ tenantId, asset, onChanged, onCrop, onSelect }: MediaCardProps): ReactElement {
  const api = useAdminApi();
  const missingAlt = isMissingAlt(asset.alt);
  const displayName = asset.originalName ?? asset.key;

  const copyKey = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(asset.key);
      toast.success('Key copiada. Pégala en el prop de imagen de un bloque.');
    } catch {
      toast.error('No pudimos copiar la key. Selecciónala manualmente.');
    }
  };

  const handleCrop = async (): Promise<void> => {
    try {
      const { pages } = await api.get(
        `/api/admin/tenants/${tenantId}/pages`,
        AdminPagesSchema,
      );

      let usedIn = 0;
      for (const page of pages) {
        let isUsed = page.ogImageKey === asset.key;
        if (!isUsed) {
          for (const section of page.sections ?? []) {
            if (Object.values(section.props ?? {}).includes(asset.key)) {
              isUsed = true;
              break;
            }
          }
        }
        if (isUsed) {
          usedIn++;
        }
      }

      if (usedIn > 0) {
        const confirmMsg = `Esta imagen se está usando en ${usedIn} página(s). El recorte creará un archivo nuevo y deberás actualizar las páginas a mano. ¿Continuar?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }

      onCrop(asset);
    } catch (e) {
      console.error(e);
      onCrop(asset); // Si falla la comprobación, igual permitimos recortar.
    }
  };

  return (
    <li className={cn('ui-card space-y-3 p-4', missingAlt && 'border-amber-400/60')}>
      <div className="bg-muted flex h-32 items-center justify-center overflow-hidden rounded-md relative group">
        {asset.mimeType.startsWith('image/') && asset.url !== undefined ? (
          <>
            {/* Decisión: Mantenemos <img> nativo para evitar que las firmas temporales saturen el disco y la caché de next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
            <img
              src={asset.url}
              alt={asset.alt ?? ''}
              className="max-h-full max-w-full object-contain transition-opacity group-hover:opacity-75"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => void handleCrop()}
            >
              Recortar
            </Button>
          </>
        ) : (
          <FileText className="text-muted-foreground size-10" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium" title={displayName}>
          {displayName}
        </p>
        <p className="text-muted-foreground text-xs">{formatMediaSize(asset.size)}</p>
      </div>

      {missingAlt && (
        <p className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
          <TriangleAlert className="size-3.5" aria-hidden="true" /> Sin texto alternativo
        </p>
      )}

      <AltEditor
        key={`${asset.key}:${asset.alt ?? ''}`}
        tenantId={tenantId}
        asset={asset}
        onSaved={onChanged}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={onSelect !== undefined ? `Seleccionar ${displayName}` : `Copiar key de ${displayName}`}
          onClick={onSelect !== undefined ? () => onSelect() : () => void copyKey()}
        >
          {onSelect !== undefined ? "Seleccionar" : <><Copy className="size-4" /> Copiar key</>}
        </Button>
        <DeleteAssetButton tenantId={tenantId} asset={asset} onDeleted={onChanged} />
      </div>
    </li>
  );
}

interface AltEditorProps {
  readonly tenantId: string;
  readonly asset: MediaAsset;
  readonly onSaved: () => void;
}

function AltEditor({ tenantId, asset, onSaved }: AltEditorProps): ReactElement {
  const api = useAdminApi();
  const [value, setValue] = useState(asset.alt ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const inputId = `alt-${asset.key}`;

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/media/${encodeURIComponent(asset.key)}`,
        { alt: value.trim() },
        MediaAssetResponseSchema,
      );
      toast.success('Texto alternativo guardado.');
      onSaved();
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos guardar el texto alternativo. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>Texto alternativo</Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Describe la imagen"
        />
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />} Guardar
        </Button>
      </div>
    </div>
  );
}

interface DeleteAssetButtonProps {
  readonly tenantId: string;
  readonly asset: MediaAsset;
  readonly onDeleted: () => void;
}

function DeleteAssetButton({
  tenantId,
  asset,
  onDeleted,
}: DeleteAssetButtonProps): ReactElement {
  const api = useAdminApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [usageWarning, setUsageWarning] = useState<string | null>(null);
  const displayName = asset.originalName ?? asset.key;

  const runDelete = async (force: boolean): Promise<void> => {
    setIsDeleting(true);
    try {
      await api.remove(
        `/api/admin/tenants/${tenantId}/media/${encodeURIComponent(asset.key)}?force=${force ? 'true' : 'false'}`,
      );
      setUsageWarning(null);
      toast.success('Imagen eliminada.');
      onDeleted();
    } catch (cause) {
      const described = describeAdminError(
        cause,
        'No pudimos eliminar la imagen. Inténtalo nuevamente.',
      );
      if (force) {
        toast.error(described.message);
      } else {
        setUsageWarning(described.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={isDeleting}
        aria-label={`Eliminar ${displayName}`}
        onClick={() => void runDelete(false)}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Eliminar
      </Button>
      {usageWarning !== null && (
        <div role="alert" className="text-destructive space-y-1.5 text-xs">
          <p>{usageWarning}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isDeleting}
            onClick={() => void runDelete(true)}
          >
            Borrar igual
          </Button>
        </div>
      )}
    </div>
  );
}

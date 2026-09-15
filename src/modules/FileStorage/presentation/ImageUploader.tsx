'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { CheckCircle2, FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { SessionExpiredError } from '@/modules/Auth/domain/Session';
import { useOptionalSession } from '@/modules/Auth/presentation/SessionProvider';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
  validateFile,
  type UploadedFile,
} from '../domain/FileUploadSchema';
import { FileStorageService } from '../application/FileStorageService';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface ImageUploaderProps {
  /**
   * Recibe la `key` del archivo subido (NO la URL: el bucket es privado y la
   * URL firmada que devuelve el upload expira). Es la `key` la que se guarda
   * como string dentro de `PageSection.props` (ej. `imageUrl`) o
   * `GlobalSetting.value` — el motor de renderizado la resuelve a una URL
   * firmada fresca en cada lectura.
   */
  readonly onUploaded: (key: string) => void;
  readonly className?: string;
}

const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function ImageUploader({
  onUploaded,
  className,
}: ImageUploaderProps): ReactElement {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessionContext = useOptionalSession();
  const token = sessionContext?.token ?? null;
  // Se recrea al cambiar el token: así el siguiente intento usa el token nuevo sin remontar.
  const fileStorageService = useMemo(
    () => new FileStorageService(getPublicApiBaseUrl(), undefined, () => token),
    [token],
  );

  useEffect(() => {
    return () => {
      if (previewUrl !== null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = async (file: File): Promise<void> => {
    const validationError = validateFile(file);
    if (validationError !== null) {
      setStatus('error');
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setUploadedFile(null);
    setErrorMessage(null);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setStatus('uploading');

    try {
      const uploaded = await fileStorageService.uploadFile(file);
      setUploadedFile(uploaded);
      setStatus('success');
      toast.success('Archivo subido correctamente.');
      onUploaded(uploaded.key);
    } catch (error) {
      // Sesión caducada y fallo de servidor se arreglan distinto: mensajes separados (SPEC 0.1).
      const message =
        error instanceof SessionExpiredError
          ? error.message
          : 'No pudimos subir el archivo. Inténtalo nuevamente en unos minutos.';
      setStatus('error');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    // Permite volver a seleccionar el mismo archivo tras un error.
    event.target.value = '';
    if (file !== undefined) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    if (status === 'uploading') {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file !== undefined) {
      void handleFile(file);
    }
  };

  const reset = (): void => {
    setStatus('idle');
    setErrorMessage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFile(null);
  };

  const openFilePicker = (): void => {
    if (status !== 'uploading') {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
        disabled={status === 'uploading'}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Subir archivo"
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
          'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          status === 'uploading' && 'pointer-events-none opacity-70',
        )}
      >
        {previewUrl !== null ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) y URLs de bucket dinámicas, fuera del optimizador de next/image
          <img
            src={previewUrl}
            alt={selectedFile?.name ?? 'Vista previa'}
            className="max-h-40 max-w-full rounded-md object-contain"
          />
        ) : selectedFile !== null ? (
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Upload className="size-10 text-muted-foreground" aria-hidden="true" />
        )}

        {status === 'uploading' ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Subiendo {selectedFile?.name}...
          </p>
        ) : status === 'success' && uploadedFile !== null ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {selectedFile?.name} ({formatSize(uploadedFile.size)}) subido
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Arrastra un archivo aquí o haz clic para seleccionarlo
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPEG, WebP, SVG o PDF — máximo {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        )}
      </div>

      {status === 'error' && errorMessage !== null && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {status === 'success' && uploadedFile !== null && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2">
          <p
            className="min-w-0 truncate text-xs text-muted-foreground"
            title={uploadedFile.url}
          >
            {uploadedFile.url}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            aria-label="Quitar archivo"
          >
            <X /> Quitar
          </Button>
        </div>
      )}
    </div>
  );
}

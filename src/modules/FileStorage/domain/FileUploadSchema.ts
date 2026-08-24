import { z } from 'zod';

/**
 * Mismas reglas que valida el backend (módulo FileStorage de
 * web-builder-api): whitelist de MIME types y tamaño máximo. La validación
 * en cliente es defensa en profundidad, no reemplaza a la del servidor.
 */
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
] as const;

// Refleja el default de MAX_FILE_SIZE_MB del backend.
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Mismo esquema que valida el backend (`FileUploadResponseSchema`):
 * única fuente de verdad en ambas fronteras.
 */
export const FileUploadResponseSchema = z.strictObject({
  key: z.string().min(1),
  url: z.url(),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export type UploadedFile = z.infer<typeof FileUploadResponseSchema>;

export interface FileCandidate {
  readonly type: string;
  readonly size: number;
}

/**
 * Retorna un mensaje de error legible para el usuario, o `null` si el
 * archivo cumple las reglas de tipo y tamaño.
 */
export const validateFile = (file: FileCandidate): string | null => {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Tipo de archivo no permitido. Usa PNG, JPEG, WebP, SVG o PDF.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
};

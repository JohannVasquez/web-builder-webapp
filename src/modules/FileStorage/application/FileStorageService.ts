import { SessionExpiredError } from '@/modules/Auth/domain/Session';
import {
  FileUploadResponseSchema,
  validateFile,
  type UploadedFile,
} from '../domain/FileUploadSchema';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

// Devuelve el token de administración vigente, o `null` si no hay sesión.
export type TokenProvider = () => string | null;

export class FileStorageService {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
    // Subir y borrar exige sesión (SPEC 0.1); sin token la API responde 401,
    // que es lo correcto si se usa desde el sitio público.
    private readonly getToken: TokenProvider = () => null,
  ) {}

  public async uploadFile(file: File): Promise<UploadedFile> {
    const validationError = validateFile(file);
    if (validationError !== null) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await this.fetchFn(`${this.baseUrl}/api/files`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: formData,
    });

    this.assertAuthorized(response);
    if (!response.ok) {
      throw new Error(`File upload failed: HTTP ${response.status}`);
    }

    const body: unknown = await response.json();
    return FileUploadResponseSchema.parse(body);
  }

  public async deleteFile(key: string): Promise<void> {
    const response = await this.fetchFn(
      `${this.baseUrl}/api/files/${encodeURIComponent(key)}`,
      { method: 'DELETE', headers: this.authHeaders() },
    );

    this.assertAuthorized(response);
    if (!response.ok) {
      throw new Error(`File deletion failed: HTTP ${response.status}`);
    }
  }

  // No fija `Content-Type`: en `FormData` lo pone el navegador junto con el
  // `boundary`, y escribirlo a mano rompe el parseo multipart.
  private authHeaders(): Record<string, string> {
    const token = this.getToken();
    return token === null ? {} : { Authorization: `Bearer ${token}` };
  }

  private assertAuthorized(response: Response): void {
    if (response.status === 401) {
      throw new SessionExpiredError();
    }
  }
}

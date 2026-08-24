import {
  FileUploadResponseSchema,
  validateFile,
  type UploadedFile,
} from '../domain/FileUploadSchema';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class FileStorageService {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
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
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: HTTP ${response.status}`);
    }

    const body: unknown = await response.json();
    return FileUploadResponseSchema.parse(body);
  }

  public async deleteFile(key: string): Promise<void> {
    const response = await this.fetchFn(
      `${this.baseUrl}/api/files/${encodeURIComponent(key)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(`File deletion failed: HTTP ${response.status}`);
    }
  }
}

import { FileStorageService } from './FileStorageService';
import { MAX_FILE_SIZE_BYTES } from '../domain/FileUploadSchema';

describe('FileStorageService', () => {
  const buildFile = (name = 'logo.png', type = 'image/png', sizeBytes = 1024): File =>
    new File([new Uint8Array(sizeBytes)], name, { type });

  const buildResponse = (status: number, body: unknown = {}): Response =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }) as Response;

  const validUploadBody = {
    key: '5f0c2f5e-0000-4000-8000-000000000000.png',
    url: 'http://localhost:9000/web-builder-assets/5f0c2f5e-0000-4000-8000-000000000000.png',
    mimeType: 'image/png',
    size: 1024,
  };

  it('posts the file as multipart form-data and returns the validated response', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(201, validUploadBody));
    const service = new FileStorageService('http://api.test', fetchFn);

    const result = await service.uploadFile(buildFile());

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/files',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) as FormData }),
    );
    const formData = fetchFn.mock.calls[0]?.[1]?.body as FormData;
    expect(formData.get('file')).toBeInstanceOf(File);
    expect(result).toEqual(validUploadBody);
  });

  it('rejects disallowed mime types locally without calling the API', async () => {
    const fetchFn = jest.fn<Promise<Response>, [string, RequestInit?]>();
    const service = new FileStorageService('http://api.test', fetchFn);

    await expect(service.uploadFile(buildFile('evil.html', 'text/html'))).rejects.toThrow(
      'Tipo de archivo no permitido',
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('rejects oversized files locally without calling the API', async () => {
    const fetchFn = jest.fn<Promise<Response>, [string, RequestInit?]>();
    const service = new FileStorageService('http://api.test', fetchFn);

    await expect(
      service.uploadFile(buildFile('big.png', 'image/png', MAX_FILE_SIZE_BYTES + 1)),
    ).rejects.toThrow('tamaño máximo');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('throws when the API responds with an error status', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(500));
    const service = new FileStorageService('http://api.test', fetchFn);

    await expect(service.uploadFile(buildFile())).rejects.toThrow('HTTP 500');
  });

  it('throws when the API response does not match the schema (strict)', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(201, { ...validUploadBody, extra: 'nope' }));
    const service = new FileStorageService('http://api.test', fetchFn);

    await expect(service.uploadFile(buildFile())).rejects.toThrow();
  });

  it('deletes a file by key, url-encoding it', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(204));
    const service = new FileStorageService('http://api.test', fetchFn);

    await service.deleteFile(validUploadBody.key);

    expect(fetchFn).toHaveBeenCalledWith(
      `http://api.test/api/files/${validUploadBody.key}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('throws when the deletion fails', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(500));
    const service = new FileStorageService('http://api.test', fetchFn);

    await expect(service.deleteFile(validUploadBody.key)).rejects.toThrow('HTTP 500');
  });
});

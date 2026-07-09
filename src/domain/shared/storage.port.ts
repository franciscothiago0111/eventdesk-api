export interface UploadFileInput {
  buffer: Buffer;
  filename: string;
  contentType?: string;
  folder?: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
}

export interface StoragePort {
  upload(input: UploadFileInput): Promise<UploadFileResult>;
  delete(key: string): Promise<void>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');

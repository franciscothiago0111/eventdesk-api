import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import {
  StoragePort,
  UploadFileInput,
  UploadFileResult,
} from '../../domain/shared/storage.port';

@Injectable()
export class MinioAdapter implements StoragePort {
  private readonly logger = new Logger(MinioAdapter.name);
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const port = process.env.MINIO_PORT ?? '9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKeyId = process.env.MINIO_ACCESS_KEY;
    const secretAccessKey = process.env.MINIO_SECRET_KEY;
    this.bucketName = process.env.MINIO_BUCKET_NAME ?? '';
    this.publicUrl = process.env.MINIO_PUBLIC_URL ?? '';

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.warn(
        'MinIO não configurado. Defina MINIO_ACCESS_KEY, MINIO_SECRET_KEY e MINIO_BUCKET_NAME.',
      );
    }

    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: { accessKeyId: accessKeyId ?? '', secretAccessKey: secretAccessKey ?? '' },
    });
  }

  async upload(input: UploadFileInput): Promise<UploadFileResult> {
    const key = input.folder ? `${input.folder}/${input.filename}` : input.filename;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );

    return { key, url: `${this.publicUrl}/${key}` };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
  }
}

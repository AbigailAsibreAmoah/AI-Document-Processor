import fs from 'fs/promises';
import path from 'path';
import { config } from '../lib/config';

export interface StorageProvider {
  upload(file: Buffer, filename: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, file);
    return filename;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    await fs.unlink(fullPath);
  }

  getUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}

class S3StorageProvider implements StorageProvider {
  // Placeholder for S3 implementation
  async upload(file: Buffer, filename: string): Promise<string> {
    // TODO: Implement S3 upload using AWS SDK
    throw new Error('S3 storage not implemented');
  }

  async delete(filePath: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3 storage not implemented');
  }

  getUrl(filePath: string): string {
    // TODO: Return S3 URL
    return `https://${config.storage.aws.bucket}.s3.${config.storage.aws.region}.amazonaws.com/${filePath}`;
  }
}

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    this.provider = config.storage.type === 's3' 
      ? new S3StorageProvider() 
      : new LocalStorageProvider();
  }

  async uploadFile(file: Buffer, filename: string): Promise<string> {
    return this.provider.upload(file, filename);
  }

  async deleteFile(filePath: string): Promise<void> {
    return this.provider.delete(filePath);
  }

  getFileUrl(filePath: string): string {
    return this.provider.getUrl(filePath);
  }
}
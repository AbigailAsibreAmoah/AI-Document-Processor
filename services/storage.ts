import { put, del } from '@vercel/blob';
import path from 'path';
import { config } from '../lib/config';

export interface StorageProvider {
  upload(file: Buffer, filename: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
}

class VercelBlobProvider implements StorageProvider {
  async upload(file: Buffer, filename: string): Promise<string> {
    const blob = await put(filename, file, { access: 'public' });
    return blob.url;
  }

  async delete(filePath: string): Promise<void> {
    await del(filePath);
  }

  getUrl(filePath: string): string {
    return filePath; // already a full URL
  }
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), 'uploads');

  async upload(file: Buffer, filename: string): Promise<string> {
    const fs = await import('fs/promises');
    try { await fs.access(this.uploadDir); } 
    catch { await fs.mkdir(this.uploadDir, { recursive: true }); }
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, file);
    return filename;
  }

  async delete(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.unlink(path.join(this.uploadDir, filePath));
  }

  getUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    if (process.env.NODE_ENV === 'production' || config.storage.type === 'blob') {
      this.provider = new VercelBlobProvider();
    } else {
      this.provider = new LocalStorageProvider();
    }
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
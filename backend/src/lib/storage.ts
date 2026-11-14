export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class CloudflareR2Storage implements IStorageService {
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    // In production, integrate AWS S3 / Cloudflare R2 client SDK
    console.log(`[Storage:R2] Uploading ${fileName} (${mimeType}), ${fileBuffer.length} bytes`);
    return `https://assets.goldstamp.io/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    console.log(`[Storage:R2] Deleting file ${fileUrl}`);
    return true;
  }
}

export class MockStorage implements IStorageService {
  async uploadFile(_fileBuffer: Buffer, fileName: string, _mimeType: string): Promise<string> {
    return `/uploads/${fileName}`;
  }

  async deleteFile(_fileUrl: string): Promise<boolean> {
    return true;
  }
}

export const storageService: IStorageService = process.env.S3_ACCESS_KEY
  ? new CloudflareR2Storage()
  : new MockStorage();

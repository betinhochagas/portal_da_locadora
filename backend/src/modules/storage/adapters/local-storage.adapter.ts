import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageAdapter } from '../storage.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);

    // If file is already saved by multer, just return the URL
    // Otherwise, save it manually
    if (file.path && fs.existsSync(file.path)) {
      // File already saved by multer diskStorage
      return Promise.resolve(`/uploads/${filename}`);
    }

    // Save file buffer to disk
    fs.writeFileSync(filePath, file.buffer);
    return Promise.resolve(`/uploads/${filename}`);
  }

  async getFilePath(filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);

    if (!(await this.fileExists(filename))) {
      throw new NotFoundException('Arquivo não encontrado no servidor');
    }

    return filePath;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return Promise.resolve();
  }

  async fileExists(filename: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, filename);
    return Promise.resolve(fs.existsSync(filePath));
  }
}

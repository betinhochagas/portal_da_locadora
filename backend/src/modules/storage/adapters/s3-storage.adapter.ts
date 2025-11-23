import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageAdapter } from '../storage.interface';
import * as fs from 'fs';

@Injectable()
export class S3StorageAdapter implements StorageAdapter {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_BUCKET', '');

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
      '',
    );

    if (!this.bucketName) {
      throw new Error(
        'AWS_BUCKET environment variable is required for S3 storage',
      );
    }

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required for S3 storage',
      );
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async saveFile(file: Express.Multer.File, filename: string): Promise<string> {
    // Determine file content based on whether multer saved to disk or memory
    let fileContent: Buffer;

    if (file.buffer) {
      // File is in memory (memoryStorage)
      fileContent = file.buffer;
    } else if (file.path) {
      // File is on disk (diskStorage) - read it
      fileContent = fs.readFileSync(file.path);
    } else {
      throw new Error('File buffer or path is required');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: fileContent,
      ContentType: file.mimetype,
      // Make files privately accessible (security best practice)
      // Access via presigned URLs only
    });

    await this.s3Client.send(command);

    // Return the S3 URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filename}`;
  }

  async getFilePath(filename: string): Promise<string> {
    // Check if file exists
    if (!(await this.fileExists(filename))) {
      throw new NotFoundException('Arquivo não encontrado no S3');
    }

    // Generate a presigned URL valid for 1 hour
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return signedUrl;
  }

  async deleteFile(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    await this.s3Client.send(command);
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'NotFound'
      ) {
        return false;
      }
      throw error;
    }
  }
}

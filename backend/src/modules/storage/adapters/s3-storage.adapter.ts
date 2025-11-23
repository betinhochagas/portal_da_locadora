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

@Injectable()
export class S3StorageAdapter implements StorageAdapter {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_BUCKET', '');

    if (!this.bucketName) {
      throw new Error(
        'AWS_BUCKET environment variable is required for S3 storage',
      );
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });
  }

  async saveFile(file: Express.Multer.File, filename: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file.buffer || file.path,
      ContentType: file.mimetype,
      // Make files publicly readable (adjust based on your security requirements)
      // ACL: 'public-read', // Uncomment if you want public access
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

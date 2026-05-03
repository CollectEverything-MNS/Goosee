import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ROOT_USER') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD') || 'minioadmin',
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'goosee-uploads';
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL') || 'http://localhost:9000';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);

        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'products'
  ): Promise<{ url: string; key: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const objectKey = `${folder}/${fileName}`;

    await this.minioClient.putObject(this.bucketName, objectKey, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = `${this.publicUrl}/${this.bucketName}/${objectKey}`;
    return { url, key: objectKey };
  }

  async deleteFile(objectKey: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, objectKey);
  }
}

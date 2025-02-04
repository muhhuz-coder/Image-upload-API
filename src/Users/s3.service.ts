// s3.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

// Add configuration object
const S3_CONFIG = {
  BUCKET_NAME: 'uploadfile1221',
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: 'AKIARWPFIK6LETVHKUFB',
      secretAccessKey: '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',
      region: 'ap-southeast-2',
    });
  }

  private validateFile(file: Express.Multer.File) {
    if (!S3_CONFIG.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        `File type not allowed. Allowed types: ${S3_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (file.size > S3_CONFIG.MAX_FILE_SIZE) {
      throw new HttpException(
        `File size too large. Maximum size: ${S3_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}-${file.originalname}`;

    try {
      // Validate file before upload
      this.validateFile(file);

      const params: AWS.S3.Types.PutObjectRequest = {
        Bucket: 'uploadfile1221',
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await this.s3.upload(params).promise();
      console.log('File uploaded successfully', uploadResult);
      return uploadResult.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new HttpException(
        `File upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<{ url: string; finalUrl: string }> {
    if (!key) {
      throw new HttpException('Key is required', HttpStatus.BAD_REQUEST);
    }

    // Generate unique filename
    const fileName = `${uuid()}-${key}`;

    const params = {
      Bucket: 'uploadfile1221',
      Key: fileName,
      Expires: expiresIn,
      ContentType: 'image/png', // You can make this dynamic if needed
    };

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      console.log('Generated presigned URL in S3Service:', url);

      // Generate the final URL where the file will be accessible
      const finalUrl = `https://${params.Bucket}.s3.ap-southeast-2.amazonaws.com/${fileName}`;

      return {
        url,
        finalUrl,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new HttpException('Failed to generate presigned URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

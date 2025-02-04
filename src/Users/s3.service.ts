import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
 
@Injectable()
export class S3Service {
  private s3: AWS.S3;
 
  constructor() {
    this.s3 = new AWS.S3({
      //accessKeyId: 'AKIARWPFIK6LETVHKUFB',
      //secretAccessKey: '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',
      region: 'ap-southeast-2',
    });
  }
 
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}-${file.originalname}`;
 
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: 'uploadfile1221',
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
 
    try {
      const uploadResult = await this.s3.upload(params).promise();
      console.log('File uploaded successfully', uploadResult); // Log the result
      return uploadResult.Location;
    } catch (error) {
      console.error('Error uploading file:', error); // Log the error
      throw new HttpException(`File upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
 
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: 'uploadfile1221',
      Key: key,
      Expires: expiresIn,
      ContentType: 'image/png', // Or adjust this if needed
    };
 
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      console.log('Generated presigned URL in S3Service:', url); // Log the URL here
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new HttpException('Failed to generate presigned URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
 
}
 
 
s3.service.ts
 
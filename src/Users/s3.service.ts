import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}-${file.originalname}`;

    // Explicitly type the params object to be a PutObjectRequest
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET as string, // Type assertion to string
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    

    // Upload file to S3 and return the file URL
    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location; // Returns the file URL
  }
}

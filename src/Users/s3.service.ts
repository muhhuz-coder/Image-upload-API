import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}-${file.originalname}`;

    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: 'source1221',
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

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<{url: string,imageUrl: string , largeimageUrl: string, mediumimageUrl:string,thumbnailimageUrl:string}> {
    const params = {
      Bucket: 'source1221',
      Key: key,
      Expires: expiresIn,
      ContentType: 'image/png', // Or adjust this if needed
    };
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      const temp = `https://${this.s3.config.region}.console.aws.amazon.com/s3/object/${params.Bucket}?region=${this.s3.config.region}&bucketType=general&prefix=`
      const imageUrl = temp + `${key}`;
      const largeimageUrl = temp+ `/processed/large_${key}`
      const mediumimageUrl = temp+ `/processed/medium_${key}`
      const thumbnailimageUrl = temp+ `/processed/thumbnail_${key}`

      return {url,imageUrl,largeimageUrl,mediumimageUrl,thumbnailimageUrl};
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new HttpException('Failed to generate presigned URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}

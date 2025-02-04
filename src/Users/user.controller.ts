// users.controller.ts
import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  async create(@Body() userData: Partial<User>) {
    return this.usersService.create(userData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query('fileName') fileName: string): Promise<{ url: string; finalUrl: string }> {
    console.log('Received fileName:', fileName);

    if (!fileName) {
      throw new HttpException('fileName is required', HttpStatus.BAD_REQUEST);
    }

    const { url, finalUrl } = await this.s3Service.generatePresignedUrl(fileName);

    console.log('Generated presigned URL:', url);
    console.log('Final URL will be:', finalUrl);

    return { url, finalUrl };
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Delete(':id')
  async remove(@Param('username') username: string) {
    return this.usersService.remove(username);
  }

  @Post('upload')
  async uploadUserImage(
    @Body('userId') userId: number,
    @Body('imageUrl') imageUrl: string
  ) {
    if (!userId || !imageUrl) {
      throw new HttpException('userId and imageUrl are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.usersService.updateUserImage(userId, imageUrl);
    } catch (error) {
      console.error('Error updating user image:', error);
      throw new HttpException(
        'Failed to update user image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}



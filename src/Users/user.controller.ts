import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,private readonly s3Service: S3Service) {}

  @Post()
  async create(@Body() userData: Partial<User>) {
    return this.usersService.create(userData);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserImage(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: number) {
    const imageUrl = await this.s3Service.uploadFile(file);
    return this.usersService.updateUserImage(userId, imageUrl);
  
}
}

 

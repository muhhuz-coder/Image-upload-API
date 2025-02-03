import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';  // Ensure this path is correct

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly s3Service: S3Service) {}

  @Post()
  async create(@Body() userData: Partial<User>) {
    return this.usersService.create(userData);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  async findAll() {
    return this.usersService.findAll();
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserImage(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: number) {
    const imageUrl = await this.s3Service.uploadFile(file);
    return this.usersService.updateUserImage(userId, imageUrl);
  }
}

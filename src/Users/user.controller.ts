import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, Query, Patch } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';  
import { v4 as uuidv4 } from 'uuid';
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
  @UseGuards(JwtAuthGuard) // guard
  async findAll() {
    return this.usersService.findAll();
  }
  

  @Get('presigned-url')
async getPresignedUrl(@Query('fileName') fileName: string): Promise<{ url: string , imageUrl :string , largeimageUrl : string,mediumimageUrl : string,thumbnailimageUrl:string}> {
  console.log('Received fileName:', fileName);

  if (!fileName) {
    throw new HttpException('fileName is required', HttpStatus.BAD_REQUEST);
  }

  const key = `${uuidv4()}-${fileName}`;
  const {url,imageUrl,largeimageUrl,mediumimageUrl,thumbnailimageUrl} = await this.s3Service.generatePresignedUrl(key);

  console.log('Generated presigned URL:', url);
  console.log('Generated image URL:',imageUrl);
  console.log('Generated image URL LARGE:',largeimageUrl);
  console.log('Generated image URL MEDIUM:',mediumimageUrl);
  console.log('Generated image URL SMALL:',thumbnailimageUrl);

  return { url, imageUrl ,largeimageUrl ,mediumimageUrl,thumbnailimageUrl};
}

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Patch(':username/update')
  async updateUserDetails(
    @Param('username') username: string,
    @Body() body: { firstName: string, lastName: string }
  ) {
    return this.usersService.updateUserDetails(username, body.firstName, body.lastName);
  }

  @Delete(':username')
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





import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './user.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService,S3Service],
  controllers: [UsersController],
})
export class UsersModule {}

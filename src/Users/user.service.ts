import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // async findOne(username: string): Promise<User | null> {
  //   return this.usersRepository.findOneBy({ username });
  // }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }


  async create(userData: Partial<User>): Promise<User> {
    // Check if the username already exists
    const existingUser = await this.usersRepository.findOneBy({
      username: userData.username, // Check by username or other unique field
    });
  
    if (existingUser) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }
  
    // Ensure password is present in userData
    if (!userData.password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }
  
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
  
    try {
      const user = this.usersRepository.create({
        ...userData,
        password: hashedPassword,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      // MySQL duplicate entry error handling (for unique constraints like username)
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
      }

      // Catch any other error and respond with internal server error
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(username: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.usersRepository.delete(username);
  }

  async updateUserImage(userId: number, imageUrl: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.profileImageUrl = imageUrl;
    return await this.usersRepository.save(user);
  }
}

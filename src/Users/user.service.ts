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
  // }\

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }


  async create(userData: Partial<User>): Promise<User> {
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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Example: Minimum 8 characters, at least one letter and one number
    if (!passwordRegex.test(userData.password)) {
      throw new HttpException('Password must be at least 8 characters long and contain at least one letter and one number', HttpStatus.BAD_REQUEST);
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

  async updateUserDetails(username: string, firstName: string, lastName: string): Promise<User> {
    // Find the user by userId
    const user = await this.usersRepository.findOneBy({ username });
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Optionally, validate firstName and lastName if necessary
    if (!firstName || !lastName) {
      throw new HttpException('First name and last name are required', HttpStatus.BAD_REQUEST);
    }
  
    // Update the user's first name and last name
    user.firstName = firstName;
    user.lastName = lastName;
  
    // Save the updated user details
    return this.usersRepository.save(user);
  }
  

  async remove(username: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.usersRepository.delete(user.id);
    } catch (error) {
      throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async updateUserImage(userId: number, imageUrl: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new HttpException('Invalid image URL', HttpStatus.BAD_REQUEST);
    }
  
    user.profileImageUrl = imageUrl;
    return this.usersRepository.save(user);
  }

  
}

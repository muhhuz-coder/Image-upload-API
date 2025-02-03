import { Injectable } from '@nestjs/common';
import { UsersService } from '../Users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';  // Assuming the interface is in the same folder or import path

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Validate user credentials (username & password)
  private async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const { password: _, ...result } = user; // Password excluded here
    return result;
  }

  // Login and generate JWT token for the user
  async login(username: string, password: string) {
    // Validate user credentials
    const user = await this.validateUser(username, password);

    // Prepare JWT payload
    const payload: JwtPayload = { username: user.username, sub: user.id };

    // Sign the JWT and set expiration time
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '5m', // Token expires in 1 hour
    });

    return {
      access_token: accessToken,
    };
  }
}

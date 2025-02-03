import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../Users/user.service'; // Adjust the path if needed
import { JwtPayload } from './jwt-payload.interface'
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT token from Authorization header
      secretOrKey: 'yoursecretkey', // Ensure this matches the key used in the JwtModule
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOneByUsername(payload.username); // Adjust method to find user by username or id

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user; // User will be added to the request object (req.user)
  }
}

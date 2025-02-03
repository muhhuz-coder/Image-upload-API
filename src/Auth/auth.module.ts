import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../Users/user.module'; // Adjust the import to point to your UsersModule
import { AuthController } from './auth.controller'
@Module({
  imports: [
    UsersModule, // Import your UsersModule to access the users service
    PassportModule, // PassportModule is needed to use passport strategies
    JwtModule.register({
      secret: 'yoursecretkey', // Ensure this matches the key in JwtStrategy
      signOptions: { expiresIn: '5m' }, // JWT expiration time
    }),
  ],
  providers: [AuthService, JwtStrategy], // Make sure JwtStrategy is listed as a provider
  exports: [AuthService],
  controllers:[AuthController]
})
export class AuthModule {}

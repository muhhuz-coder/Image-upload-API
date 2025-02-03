
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Users/user.entity';
import { UsersModule } from './Users/user.module';
import { AuthModule } from './Auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'database-first.cv6q86yyyce6.ap-southeast-2.rds.amazonaws.com',
      port: 3306,
      username: 'adminHuzaifa',
      password: 'As5526as123',
      database: 'volunteer_db',
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule
  ],
})
export class AppModule {}



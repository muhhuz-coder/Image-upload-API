//user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string; // Username for login

  @Column()
  password: string; // Password (hashed)

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  profileImageUrl: string; // Store the image URL
}

import { randomUUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  static create(name: string, email: string): User {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    const user = new User();
    user.id = randomUUID();
    user.name = name;
    user.email = email;
    return user;
  }
}

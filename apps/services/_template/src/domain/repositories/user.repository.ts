import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  deleteById(id: string): Promise<void>;
}

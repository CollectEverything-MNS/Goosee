import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract save(user: User): Promise<User>;
  abstract findAll(): Promise<User[]>;
  abstract deleteById(id: string): Promise<void>;
}

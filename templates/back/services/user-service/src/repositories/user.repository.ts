import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract save(user: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract list(): Promise<User[]>;
  abstract listCustomers(): Promise<User[]>;
  abstract listAdmins(): Promise<User[]>;
  abstract findByAuthId(authId: string): Promise<User | null>;
  abstract deleteById(id: string): Promise<void>;
}

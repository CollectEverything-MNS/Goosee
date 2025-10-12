import { User } from '../../entities/user.entity';
import { IUserRepository } from '../user.repository';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async deleteById(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}

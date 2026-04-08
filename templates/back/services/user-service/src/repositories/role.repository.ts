import { Role } from '../entities/role.entity';

export abstract class IRoleRepository {
  abstract save(role: Role): Promise<Role>;
  abstract findById(id: string): Promise<Role | null>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract list(): Promise<Role[]>;
  abstract deleteById(id: string): Promise<void>;
  abstract count(): Promise<number>;
}

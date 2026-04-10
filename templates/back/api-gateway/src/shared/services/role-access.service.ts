import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { serviceUrl } from '../../config/services.config';
import { HttpProxyService } from './http-proxy.service';

type RoleDto = {
  name: string;
  pageKeys: string[];
};

type ListRolesResponse = {
  roles: RoleDto[];
};

const CACHE_TTL_MS = 30_000;

@Injectable()
export class RoleAccessService {
  private readonly cache = new Map<string, { value: Set<string>; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly httpProxy: HttpProxyService,
  ) {}

  async getAllowedPageKeys(roleNames: string[]): Promise<Set<string>> {
    const normalizedRoles = Array.from(
      new Set(roleNames.map((role) => role.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
    const cacheKey = normalizedRoles.join('|');

    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return new Set(cached.value);
    }

    const userServiceUrl = serviceUrl(this.config).user;
    const response = await this.httpProxy.get<ListRolesResponse>(
      `${userServiceUrl}/roles`,
      'Resolve roles failed',
    );

    const roleNamesSet = new Set(normalizedRoles);
    const allowedPageKeys = new Set<string>();

    for (const role of response.roles ?? []) {
      if (!roleNamesSet.has(role.name)) {
        continue;
      }
      for (const pageKey of role.pageKeys ?? []) {
        const normalizedPageKey = pageKey.trim();
        if (normalizedPageKey) {
          allowedPageKeys.add(normalizedPageKey);
        }
      }
    }

    if (!allowedPageKeys.size) {
      throw new ForbiddenException('Insufficient role');
    }

    this.cache.set(cacheKey, {
      value: new Set(allowedPageKeys),
      expiresAt: now + CACHE_TTL_MS,
    });

    return allowedPageKeys;
  }
}

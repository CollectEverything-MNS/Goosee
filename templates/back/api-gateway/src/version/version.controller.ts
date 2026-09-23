import {
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

// Version du site (template) et montée de version déclenchée depuis le back-office client.
// La version déployée est injectée par l'orchestrateur (APP_VERSION), la dernière version
// disponible est lue en direct auprès de l'orchestrateur (ORCHESTRATOR_URL).
@Controller('version')
export class VersionController {
  private get orchestrator(): string | undefined {
    return process.env.ORCHESTRATOR_URL;
  }
  private get slug(): string | undefined {
    return process.env.TENANT_SLUG;
  }
  private get token(): string | undefined {
    return process.env.INTERNAL_API_TOKEN;
  }
  private current(): string {
    return process.env.APP_VERSION || '0.0.0';
  }

  private async latest(): Promise<string> {
    if (!this.orchestrator) return this.current();
    try {
      const res = await fetch(`${this.orchestrator}/platform/version`);
      if (!res.ok) return this.current();
      const data = (await res.json()) as { version?: string };
      return data?.version ?? this.current();
    } catch {
      return this.current();
    }
  }

  private parse(v: string): [number, number, number] | null {
    const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  }

  // Nature de la mise à jour disponible. Les patches s'appliquent automatiquement (cron), donc
  // la bannière client ne s'affiche que pour 'minor'/'major' (choix laissé au client).
  private updateType(current: string, latest: string): 'none' | 'patch' | 'minor' | 'major' {
    const c = this.parse(current);
    const l = this.parse(latest);
    if (!c || !l) return 'none';
    if (l[0] > c[0]) return 'major';
    if (l[0] < c[0]) return 'none';
    if (l[1] > c[1]) return 'minor';
    if (l[1] < c[1]) return 'none';
    if (l[2] > c[2]) return 'patch';
    return 'none';
  }

  // Contenu de la mise à jour : liste des changements depuis la version actuelle du site.
  private async changes(current: string): Promise<string[]> {
    if (!this.orchestrator) return [];
    try {
      const res = await fetch(
        `${this.orchestrator}/platform/changelog?from=${encodeURIComponent(current)}`,
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { changes?: string[] };
      return Array.isArray(data?.changes) ? data.changes : [];
    } catch {
      return [];
    }
  }

  // Public : état de version du site, consommé par la bannière et l'affichage des settings.
  @Get()
  async info() {
    const current = this.current();
    const latest = await this.latest();
    const type = this.updateType(current, latest);
    return {
      current,
      latest,
      updateType: type,
      updateAvailable: type !== 'none',
      changes: type !== 'none' ? await this.changes(current) : [],
    };
  }

  // Le client accepte la mise à jour : la gateway demande à l'orchestrateur de mettre à jour
  // CE site (identifié par son slug + son jeton interne). Réservé aux admins (page settings).
  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('settings')
  async update() {
    if (!this.orchestrator || !this.slug || !this.token) {
      throw new ServiceUnavailableException('Mise à jour indisponible pour ce site');
    }
    let res: Response;
    try {
      res = await fetch(`${this.orchestrator}/tenants/self/update`, {
        method: 'POST',
        headers: {
          'x-tenant-slug': this.slug,
          'x-tenant-token': this.token,
        },
      });
    } catch (err) {
      throw new ServiceUnavailableException(
        `Orchestrateur injoignable : ${(err as Error).message}`,
      );
    }
    if (!res.ok) {
      throw new ServiceUnavailableException(`Mise à jour échouée (${res.status})`);
    }
    return (await res.json()) as { version: string };
  }
}

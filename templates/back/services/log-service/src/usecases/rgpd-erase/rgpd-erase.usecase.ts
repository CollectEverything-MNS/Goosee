import { Injectable } from '@nestjs/common';
import { ILogRepository } from '../../repositories/log.repository';

export interface RgpdEraseResult {
  service: string;
  statut: 'efface' | 'absent';
  entrees: number;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(private readonly logRepo: ILogRepository) {}

  // La CNIL demande que les journaux ne survivent pas a leur donnee source.
  async execute(userId: string): Promise<RgpdEraseResult> {
    const entrees = await this.logRepo.deleteByUserId(userId);
    return { service: 'log', statut: entrees > 0 ? 'efface' : 'absent', entrees };
  }
}

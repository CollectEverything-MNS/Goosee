import { ConfigService } from '@nestjs/config';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { KnowledgeBaseService } from './knowledge-base.service';

const configWith = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('KnowledgeBaseService', () => {
  it("charge le document depuis ASSISTANT_KNOWLEDGE_PATH et l'injecte dans le prompt systeme", () => {
    const dir = mkdtempSync(join(tmpdir(), 'goosee-kb-'));
    const path = join(dir, 'guide.md');
    writeFileSync(path, '# Guide\n\nPour ajouter un produit, ouvrez Produits.');

    const service = new KnowledgeBaseService(configWith({ ASSISTANT_KNOWLEDGE_PATH: path }));
    service.onModuleInit();

    expect(service.getDocument()).toContain('Pour ajouter un produit');
    const prompt = service.buildSystemPrompt();
    expect(prompt).toContain('--- DOCUMENTATION ---');
    expect(prompt).toContain('Pour ajouter un produit, ouvrez Produits.');
    expect(prompt).toContain('ticket de support');
  });

  it('charge le guide embarque par defaut', () => {
    const service = new KnowledgeBaseService(configWith({}));
    service.onModuleInit();

    expect(service.getDocument()).toContain('# Guide utilisateur');
  });

  it('laisse le document vide si le fichier est introuvable', () => {
    const service = new KnowledgeBaseService(
      configWith({ ASSISTANT_KNOWLEDGE_PATH: '/chemin/inexistant.md' })
    );
    service.onModuleInit();

    expect(service.getDocument()).toBe('');
  });
});

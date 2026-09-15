import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { GeminiClient } from './gemini.client';

const configWith = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const jsonResponse = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

class TestableGeminiClient extends GeminiClient {
  constructor(config: ConfigService, fetchFn: jest.Mock) {
    super(config);
    this.fetchFn = fetchFn as unknown as typeof fetch;
  }
}

describe('GeminiClient', () => {
  it('repond 503 si la cle API est absente', async () => {
    const client = new TestableGeminiClient(configWith({}), jest.fn());

    await expect(client.generate('sys', [{ role: 'user', content: 'q' }])).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });

  it("appelle l'API Gemini avec le prompt systeme et les roles convertis", async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { candidates: [{ content: { parts: [{ text: 'Bonjour ' }, { text: '!' }] } }] }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'gemini-test' }), fetchFn);

    const answer = await client.generate('SYS', [
      { role: 'user', content: 'Salut' },
      { role: 'assistant', content: 'Oui ?' },
    ]);

    expect(answer).toBe('Bonjour !');
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toContain('/models/gemini-test:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('k');
    const body = JSON.parse(init.body);
    expect(body.system_instruction.parts[0].text).toBe('SYS');
    expect(body.contents.map((c: { role: string }) => c.role)).toEqual(['user', 'model']);
  });

  it('utilise le modele par defaut si GEMINI_MODEL est absent', () => {
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), jest.fn());
    expect(client.name).toBe('gemini-2.5-flash');
  });

  it('traduit un 429 en TOO_MANY_REQUESTS', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(429, {}));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
  });

  it('traduit une erreur HTTP en BAD_GATEWAY', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(500, { error: { message: 'boom' } }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({ status: HttpStatus.BAD_GATEWAY });
  });

  it('traduit une erreur reseau en BAD_GATEWAY', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('ECONNRESET'));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({ status: HttpStatus.BAD_GATEWAY });
  });

  it('renvoie un refus lisible quand le prompt est bloque', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, { promptFeedback: { blockReason: 'SAFETY' } }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).resolves.toMatch(/ne peux pas repondre/);
  });

  it('echoue si la reponse est vide', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, { candidates: [] }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({ status: HttpStatus.BAD_GATEWAY });
  });
});

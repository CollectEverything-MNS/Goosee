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
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse(200, {
        candidates: [{ content: { parts: [{ text: 'Bonjour ' }, { text: '!' }] } }],
      })
    );
    const client = new TestableGeminiClient(
      configWith({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'gemini-test' }),
      fetchFn
    );

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

  it('bascule sur le modele de repli quand le principal repond 503', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: { message: 'high demand' } }))
      .mockResolvedValueOnce(
        jsonResponse(200, { candidates: [{ content: { parts: [{ text: 'Repli OK' }] } }] })
      );
    const client = new TestableGeminiClient(
      configWith({
        GEMINI_API_KEY: 'k',
        GEMINI_MODEL: 'gemini-principal',
        GEMINI_FALLBACK_MODELS: 'gemini-repli-1, gemini-repli-2',
      }),
      fetchFn
    );

    const answer = await client.generate('SYS', [{ role: 'user', content: 'Salut' }]);

    expect(answer).toBe('Repli OK');
    expect(client.models).toEqual(['gemini-principal', 'gemini-repli-1', 'gemini-repli-2']);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn.mock.calls[0][0]).toContain('/models/gemini-principal:');
    expect(fetchFn.mock.calls[1][0]).toContain('/models/gemini-repli-1:');
  });

  it('bascule aussi sur 429 et sur erreur reseau, puis renvoie la derniere erreur', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, {}))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(jsonResponse(429, {}));
    const client = new TestableGeminiClient(
      configWith({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'a', GEMINI_FALLBACK_MODELS: 'b,c' }),
      fetchFn
    );

    await expect(client.generate('SYS', [])).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('ne bascule pas sur une erreur 4xx metier', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(400, { error: { message: 'bad' } }));
    const client = new TestableGeminiClient(
      configWith({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'a', GEMINI_FALLBACK_MODELS: 'b' }),
      fetchFn
    );

    await expect(client.generate('SYS', [])).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('utilise les modeles de repli par defaut si GEMINI_FALLBACK_MODELS est absent', () => {
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), jest.fn());
    expect(client.models).toEqual([
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ]);
  });

  it('utilise le modele par defaut si GEMINI_MODEL est absent', () => {
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), jest.fn());
    expect(client.name).toBe('gemini-3.6-flash');
  });

  it('traduit un 429 en TOO_MANY_REQUESTS', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(429, {}));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('traduit une erreur HTTP en BAD_GATEWAY', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(500, { error: { message: 'boom' } }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
    });
  });

  it('traduit une erreur reseau en BAD_GATEWAY', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('ECONNRESET'));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
    });
  });

  it('renvoie un refus lisible quand le prompt est bloque', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { promptFeedback: { blockReason: 'SAFETY' } }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).resolves.toMatch(/ne peux pas repondre/);
  });

  it('echoue si la reponse est vide', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, { candidates: [] }));
    const client = new TestableGeminiClient(configWith({ GEMINI_API_KEY: 'k' }), fetchFn);

    await expect(client.generate('s', [])).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
    });
  });
});

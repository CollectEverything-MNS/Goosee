import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssistantModel, ChatMessage } from './assistant-model';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.6-flash';
const REQUEST_TIMEOUT_MS = 30_000;

type FetchFn = typeof fetch;

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

@Injectable()
export class GeminiClient implements AssistantModel {
  private readonly logger = new Logger(GeminiClient.name);
  readonly name: string;
  // Remplacable dans les tests unitaires ; pas un parametre du constructeur pour ne pas perturber l'injection Nest.
  protected fetchFn: FetchFn = (input, init) => fetch(input, init);

  constructor(private readonly config: ConfigService) {
    this.name = this.config.get<string>('GEMINI_MODEL') || DEFAULT_MODEL;
  }

  async generate(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Assistant non configure : GEMINI_API_KEY manquante');
    }

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    };

    let response: Response;
    try {
      response = await this.fetchFn(`${GEMINI_API_URL}/${this.name}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error('Appel Gemini impossible', error);
      throw new BadGatewayException('Assistant injoignable');
    }

    if (response.status === 429) {
      throw new HttpException('Quota Gemini atteint, reessayez dans une minute', HttpStatus.TOO_MANY_REQUESTS);
    }

    const data = (await response.json().catch(() => ({}))) as GeminiResponse;

    if (!response.ok) {
      this.logger.error(`Gemini ${response.status} : ${data.error?.message ?? 'reponse invalide'}`);
      throw new BadGatewayException('Assistant en erreur');
    }

    if (data.promptFeedback?.blockReason) {
      return 'Je ne peux pas repondre a cette demande.';
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    if (!text) {
      throw new BadGatewayException('Reponse vide de l\'assistant');
    }
    return text;
  }
}

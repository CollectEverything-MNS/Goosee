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
// Modeles de repli essayes dans l'ordre quand le modele principal est sature (503 / 429) ou
// en erreur : les modeles les plus demandes connaissent des pics de saturation passagers.
const DEFAULT_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
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
  // Modele principal puis modeles de repli (GEMINI_FALLBACK_MODELS, liste separee par des virgules).
  readonly models: string[];
  // Remplacable dans les tests unitaires ; pas un parametre du constructeur pour ne pas perturber l'injection Nest.
  protected fetchFn: FetchFn = (input, init) => fetch(input, init);

  constructor(private readonly config: ConfigService) {
    this.name = this.config.get<string>('GEMINI_MODEL') || DEFAULT_MODEL;
    const fallbacks = (
      this.config.get<string>('GEMINI_FALLBACK_MODELS') ?? DEFAULT_FALLBACK_MODELS.join(',')
    )
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    this.models = [this.name, ...fallbacks.filter((m) => m !== this.name)];
  }

  // Essaie chaque modele dans l'ordre ; ne bascule que sur une erreur imputable au modele ou au
  // reseau (injoignable, 429, 5xx). Une reponse bloquee, vide ou un 4xx metier est renvoye tel quel.
  async generate(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Assistant non configure : GEMINI_API_KEY manquante');
    }

    let lastError: HttpException | undefined;
    for (const model of this.models) {
      try {
        return await this.generateWith(model, apiKey, systemPrompt, messages);
      } catch (error) {
        if (!(error instanceof RetryableModelError)) throw error;
        lastError = error.cause;
        this.logger.warn(
          `Modele ${model} indisponible (${error.message}) : essai du modele suivant`
        );
      }
    }
    throw lastError ?? new BadGatewayException('Assistant en erreur');
  }

  private async generateWith(
    model: string,
    apiKey: string,
    systemPrompt: string,
    messages: ChatMessage[]
  ): Promise<string> {
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
      response = await this.fetchFn(`${GEMINI_API_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error('Appel Gemini impossible', error);
      throw new RetryableModelError(
        'injoignable',
        new BadGatewayException('Assistant injoignable')
      );
    }

    if (response.status === 429) {
      throw new RetryableModelError(
        'quota atteint',
        new HttpException(
          'Quota Gemini atteint, reessayez dans une minute',
          HttpStatus.TOO_MANY_REQUESTS
        )
      );
    }

    const data = (await response.json().catch(() => ({}))) as GeminiResponse;

    if (!response.ok) {
      this.logger.error(`Gemini ${response.status} : ${data.error?.message ?? 'reponse invalide'}`);
      const failure = new BadGatewayException('Assistant en erreur');
      if (response.status >= 500) throw new RetryableModelError(`HTTP ${response.status}`, failure);
      throw failure;
    }

    if (data.promptFeedback?.blockReason) {
      return 'Je ne peux pas repondre a cette demande.';
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim();
    if (!text) {
      throw new BadGatewayException("Reponse vide de l'assistant");
    }
    return text;
  }
}

// Erreur interne signalant qu'un autre modele merite d'etre tente ; `cause` est l'erreur HTTP a
// renvoyer au client si tous les modeles echouent.
class RetryableModelError extends Error {
  constructor(
    message: string,
    readonly cause: HttpException
  ) {
    super(message);
  }
}

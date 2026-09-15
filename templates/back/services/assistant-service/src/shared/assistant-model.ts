export const ASSISTANT_MODEL = Symbol('ASSISTANT_MODEL');

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AssistantModel {
  readonly name: string;
  generate(systemPrompt: string, messages: ChatMessage[]): Promise<string>;
}

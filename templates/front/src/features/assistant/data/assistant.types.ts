export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AskAssistantPayload {
  question: string;
  history?: ChatMessage[];
}

export interface AskAssistantResponse {
  answer: string;
  model: string;
}

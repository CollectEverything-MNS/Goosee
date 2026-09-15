import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AskAssistantPayload, AskAssistantResponse } from '../data/assistant.types';

const askAssistant = async (payload: AskAssistantPayload): Promise<AskAssistantResponse> => {
  return api.post('/assistant/ask', payload);
};

export function useAskAssistant() {
  return useMutation({
    mutationFn: askAssistant,
  });
}

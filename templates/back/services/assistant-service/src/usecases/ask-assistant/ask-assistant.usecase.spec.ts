import { AskAssistantUseCase } from './ask-assistant.usecase';
import { AssistantModel, ChatMessage } from '../../shared/assistant-model';
import { KnowledgeBaseService } from '../../shared/knowledge-base.service';

describe('AskAssistantUseCase', () => {
  let model: jest.Mocked<AssistantModel>;
  let knowledgeBase: jest.Mocked<Pick<KnowledgeBaseService, 'buildSystemPrompt'>>;
  let usecase: AskAssistantUseCase;

  beforeEach(() => {
    model = { name: 'test-model', generate: jest.fn().mockResolvedValue('Voici la reponse.') };
    knowledgeBase = { buildSystemPrompt: jest.fn().mockReturnValue('SYSTEM PROMPT AVEC LA DOC') };
    usecase = new AskAssistantUseCase(model, knowledgeBase as unknown as KnowledgeBaseService);
  });

  it("envoie le prompt systeme, l'historique et la question au modele", async () => {
    const result = await usecase.execute({
      question: '  Comment ajouter un produit ?  ',
      history: [
        { role: 'user', content: 'Bonjour' },
        { role: 'assistant', content: 'Bonjour, que puis-je faire ?' },
      ],
    });

    expect(knowledgeBase.buildSystemPrompt).toHaveBeenCalledTimes(1);
    const [systemPrompt, messages] = model.generate.mock.calls[0];
    expect(systemPrompt).toBe('SYSTEM PROMPT AVEC LA DOC');
    expect(messages).toEqual<ChatMessage[]>([
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Bonjour, que puis-je faire ?' },
      { role: 'user', content: 'Comment ajouter un produit ?' },
    ]);
    expect(result).toEqual({ answer: 'Voici la reponse.', model: 'test-model' });
  });

  it("ne garde que les 10 derniers messages de l'historique et ignore les messages vides", async () => {
    const history = Array.from({ length: 14 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as ChatMessage['role'],
      content: `message ${i}`,
    }));
    history.push({ role: 'user', content: '   ' });

    await usecase.execute({ question: 'Question', history });

    const [, messages] = model.generate.mock.calls[0];
    // 10 derniers de l'historique (messages 5 a 13 + le vide), le vide retire, plus la question
    expect(messages).toHaveLength(10);
    expect(messages[0].content).toBe('message 5');
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'Question' });
  });

  it('fonctionne sans historique', async () => {
    await usecase.execute({ question: 'Ou sont les statistiques ?' });

    const [, messages] = model.generate.mock.calls[0];
    expect(messages).toEqual([{ role: 'user', content: 'Ou sont les statistiques ?' }]);
  });

  it("propage l'erreur du modele", async () => {
    model.generate.mockRejectedValueOnce(new Error('quota'));

    await expect(usecase.execute({ question: 'Test' })).rejects.toThrow('quota');
  });
});

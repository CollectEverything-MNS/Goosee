'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAskAssistant } from '../usecases/use-ask-assistant';
import { ChatMessage } from '../data/assistant.types';

const HISTORY_LIMIT = 10;

export function AssistantWidget() {
  const t = useTranslations('admin.assistant');
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate, isPending } = useAskAssistant();

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    textareaRef.current?.focus();
  }, [open, messages, isPending]);

  const send = () => {
    const trimmed = question.trim();
    if (!trimmed || isPending) return;

    const history = messages.slice(-HISTORY_LIMIT);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');
    setError(null);

    mutate(
      { question: trimmed, history },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        },
        onError: () => setError(t('error')),
      }
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label={t('title')}
          className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-xl"
        >
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold leading-none">{t('title')}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t('close')}>
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            <Bubble role="assistant">{t('welcome')}</Bubble>
            {messages.map((message, index) => (
              <Bubble key={index} role={message.role}>
                {message.content}
              </Bubble>
            ))}
            {isPending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                {t('thinking')}
              </div>
            )}
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t p-3">
            <label htmlFor="assistant-question" className="sr-only">
              {t('placeholder')}
            </label>
            <div className="flex items-end gap-2">
              <Textarea
                id="assistant-question"
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('placeholder')}
                rows={2}
                maxLength={2000}
                className="min-h-0 resize-none"
              />
              <Button type="submit" size="icon" disabled={isPending || !question.trim()} aria-label={t('send')}>
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{t('poweredBy')}</p>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="lg"
        className="h-12 w-12 rounded-full p-0 shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('close') : t('open')}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </Button>
    </div>
  );
}

function Bubble({ role, children }: { role: ChatMessage['role']; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        {children}
      </div>
    </div>
  );
}

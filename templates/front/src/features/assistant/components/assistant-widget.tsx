'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label={t('title')}
          className="flex h-[34rem] w-[26rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-violet-200 bg-background shadow-2xl shadow-violet-500/20 dark:border-violet-900"
        >
          <header className="flex items-center justify-between bg-violet-600 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold leading-none">{t('title')}</h2>
                <p className="mt-1 text-xs text-white/85">{t('subtitle')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-4 py-4 text-sm"
          >
            <Bubble role="assistant">{t('welcome')}</Bubble>
            {messages.map((message, index) => (
              <Bubble key={index} role={message.role}>
                {message.content}
              </Bubble>
            ))}
            {isPending && (
              <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" aria-hidden="true" />
                {t('thinking')}
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t bg-background p-3">
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
                className="min-h-0 resize-none focus-visible:ring-violet-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isPending || !question.trim()}
                aria-label={t('send')}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{t('poweredBy')}</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('close') : t('open')}
        className={cn(
          'group relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-transform',
          'bg-violet-600 hover:scale-105 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50'
        )}
      >
        {!open && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-3.5 w-3.5"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-orange-500 ring-2 ring-background" />
          </span>
        )}
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
        <span>{open ? t('close') : t('launcher')}</span>
      </button>
    </div>
  );
}

function Bubble({ role, children }: { role: ChatMessage['role']; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow"
        >
          <Sparkles className="h-4 w-4" />
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 shadow-sm',
          isUser
            ? 'rounded-br-sm bg-violet-600 text-white'
            : 'rounded-bl-sm border border-violet-200 bg-white text-foreground dark:border-violet-900 dark:bg-card'
        )}
      >
        {children}
      </div>
    </div>
  );
}

import { Bot, Loader2, Send, Sparkles, StopCircle, User as UserIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ai } from '../api/client';
import type { ChatMessage } from '../types';

type Mode = 'tutor' | 'roleplay';

interface BaseProps {
  moduleId: string;
  initialGreeting?: string;
}

interface TutorProps extends BaseProps {
  mode: 'tutor';
}

interface RoleplayProps extends BaseProps {
  mode: 'roleplay';
  scenarioId: string;
  onEndConversation?: (transcript: ChatMessage[]) => void;
}

type Props = TutorProps | RoleplayProps;

export default function AIChat(props: Props) {
  const { mode, moduleId, initialGreeting } = props;
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialGreeting ? [{ role: 'assistant', content: initialGreeting }] : [],
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const newUserMsg: ChatMessage = { role: 'user', content: text };
    const nextHistory = [...messages, newUserMsg];
    setMessages(nextHistory);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const result =
        mode === 'tutor'
          ? await ai.tutor(moduleId, text, messages)
          : await ai.roleplay(moduleId, (props as RoleplayProps).scenarioId, text, messages);
      setMessages([...nextHistory, { role: 'assistant', content: result.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(nextHistory);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-nt-primary/10 text-nt-primary-dark">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {mode === 'tutor' ? 'AI Tutor' : 'Customer Roleplay'}
            </div>
            <div className="text-xs text-gray-500">
              {mode === 'tutor' ? 'Ask anything about this module' : 'Stay in character as the CSR'}
            </div>
          </div>
        </div>

        {mode === 'roleplay' && (
          <button
            type="button"
            onClick={() => (props as RoleplayProps).onEndConversation?.(messages)}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StopCircle className="h-3.5 w-3.5" />
            End &amp; Grade
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
            <Bot className="mb-2 h-8 w-8 text-gray-300" />
            <p>{mode === 'tutor' ? 'Ask a question to start the conversation.' : 'Send your opening line to begin the call.'}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'tutor' ? 'Ask a question…' : 'Type your reply as the CSR…'}
            rows={2}
            className="input resize-none"
            disabled={sending}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="btn-primary !p-2"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-nt-primary text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-nt-primary text-white'
            : 'rounded-tl-sm bg-gray-100 text-gray-900'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

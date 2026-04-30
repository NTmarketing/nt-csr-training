import { Bot, Loader2, Send, Sparkles, StopCircle, Trash2, User as UserIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ai } from '../api/client';
import type { ChatMessage } from '../types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(mode === 'tutor');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate persisted tutor conversation; roleplay starts fresh.
  useEffect(() => {
    let cancelled = false;
    if (mode === 'tutor') {
      setHydrating(true);
      ai
        .getConversation(moduleId)
        .then((conv) => {
          if (cancelled) return;
          if (conv && Array.isArray(conv.messages) && conv.messages.length > 0) {
            setMessages(conv.messages);
          } else if (initialGreeting) {
            setMessages([{ role: 'assistant', content: initialGreeting }]);
          }
        })
        .catch(() => {
          if (!cancelled && initialGreeting) {
            setMessages([{ role: 'assistant', content: initialGreeting }]);
          }
        })
        .finally(() => {
          if (!cancelled) setHydrating(false);
        });
    } else {
      setMessages(initialGreeting ? [{ role: 'assistant', content: initialGreeting }] : []);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, moduleId]);

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
      if (mode === 'tutor') {
        const result = await ai.tutor(moduleId, text);
        // Server returns canonical conversation — trust it. Falls back to local
        // append if response shape is missing messages for any reason.
        if (Array.isArray(result.messages)) {
          setMessages(result.messages);
        } else {
          setMessages([...nextHistory, { role: 'assistant', content: result.message }]);
        }
      } else {
        const result = await ai.roleplay(
          moduleId,
          (props as RoleplayProps).scenarioId,
          text,
          messages,
        );
        setMessages([...nextHistory, { role: 'assistant', content: result.message }]);
      }
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

  const handleClearTutor = async () => {
    if (mode !== 'tutor') return;
    if (!confirm('Clear this tutor conversation? You can start a new thread.')) return;
    try {
      await ai.clearConversation(moduleId);
      setMessages(initialGreeting ? [{ role: 'assistant', content: initialGreeting }] : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear conversation');
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

        {mode === 'tutor' && messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearTutor}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Clear this conversation"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}

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
        {hydrating && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading previous conversation…</span>
          </div>
        )}

        {!hydrating && messages.length === 0 && (
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
            disabled={sending || hydrating}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || hydrating || !input.trim()}
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

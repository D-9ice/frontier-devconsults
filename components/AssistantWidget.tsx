'use client';

import { RotateCcw, Send, UserRound, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { role: string; content: string };

function sessionId() {
  const key = 'frontier-assistant-session';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const restoreLauncherFocus = useRef(false);

  const dismiss = () => {
    restoreLauncherFocus.current = true;
    setOpen(false);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('frontier-whatsapp-open', close);
    return () => window.removeEventListener('frontier-whatsapp-open', close);
  }, []);

  useEffect(() => {
    if (open || !restoreLauncherFocus.current) return;
    restoreLauncherFocus.current = false;
    const timer = window.setTimeout(() => launcher.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    if (!next) restoreLauncherFocus.current = true;
    setOpen(next);
    if (next) window.dispatchEvent(new Event('frontier-assistant-open'));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || pending) return;
    const userMessage: Message = { role: 'user', content };
    const next = [...messages, userMessage].slice(-8);
    setMessages(next);
    setInput('');
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frontier-Session': sessionId() },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable.');
      setMessages([...next, { role: 'assistant', content: String(data.answer) }].slice(-8));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The assistant is unavailable.');
    } finally {
      setPending(false);
    }
  };

  return <>
    {open && <>
      <div className="fixed inset-0 z-[55] bg-slate-950/35" aria-hidden="true" onClick={dismiss} />
      <section id="frontier-assistant-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby="assistant-title" className="fixed right-3 z-[60] flex max-h-[min(38rem,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white">
          <div className="flex items-center gap-3"><UserRound className="h-6 w-6" aria-hidden="true" /><h2 id="assistant-title" className="font-bold">Frontier Assistant</h2></div>
          <button ref={closeButton} type="button" onClick={dismiss} aria-label="Close Frontier Assistant" className="min-h-11 min-w-11 rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite" aria-atomic="false">
          {messages.length === 0 && <div className="rounded-xl bg-white p-4 text-sm leading-6 text-gray-700 shadow-sm"><p className="font-semibold text-gray-900">How can I help?</p><p className="mt-1">Ask about our published services, apps, solutions, or engagement options.</p></div>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>{message.content}</div>)}
          {pending && <p className="text-sm text-gray-600">Frontier Assistant is responding…</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <form onSubmit={submit} className="border-t border-gray-200 bg-white p-3">
          <label htmlFor="assistant-message" className="sr-only">Message Frontier Assistant</label>
          <div className="flex gap-2"><input id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} placeholder="Ask about our services…" className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2" /><button type="submit" disabled={pending || !input.trim()} aria-label="Send message" className="min-h-11 min-w-11 rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50"><Send className="h-5 w-5" /></button><button type="button" onClick={() => { setMessages([]); setError(''); }} aria-label="Clear conversation" className="min-h-11 min-w-11 rounded-lg border border-gray-300 p-2.5 text-gray-700 hover:bg-gray-50"><RotateCcw className="h-5 w-5" /></button></div>
          <p className="mt-2 text-xs text-gray-500">Do not share passwords, payment details, health records, or confidential information.</p>
        </form>
      </section>
    </>}
    <button ref={launcher} type="button" onClick={toggle} aria-expanded={open} aria-controls="frontier-assistant-dialog" className="fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }} aria-label={open ? 'Close Frontier Assistant' : 'Open Frontier Assistant'}>{open ? <X className="h-6 w-6" /> : <span aria-hidden="true" className="flex flex-col items-center text-[11px] font-black leading-[0.9] tracking-wide"><span>ASK</span><span>ME</span></span>}</button>
  </>;
}

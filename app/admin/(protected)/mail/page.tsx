'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Message = { id: string; from: string; to: string[]; subject: string; created_at: string; last_event?: string };
type Detail = Message & { text: string; htmlOnly: boolean; replyTo: string; ticket: string | null; attachments: { filename: string; size: number }[] };

export default function AdminMail() {
  const [folder, setFolder] = useState('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [draft, setDraft] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const generation = useRef(0);

  async function load(after?: string) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    const current = ++generation.current;
    try {
      const response = await fetch(`/api/admin/mail?folder=${folder}${after ? `&after=${after}` : ''}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load mail');
      if (current === generation.current) {
        setMessages(previous => after ? [...previous, ...data.messages] : data.messages);
        setNext(data.next);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load mail'); }
    finally { lock.current = false; setBusy(false); }
  }
  useEffect(() => { void load(); /* Folder switches are disabled during requests. */ }, [folder]); // eslint-disable-line react-hooks/exhaustive-deps

  function leaveDraft() {
    return !draft || accepted || window.confirm('Leave this draft? It is not saved. If sending was uncertain, check Sent before creating another reply.');
  }
  async function open(message: Message) {
    if (lock.current || !leaveDraft()) return;
    lock.current = true; setBusy(true); setError(''); setNotice(''); setDetail(null);
    setDraft(''); setAttempted(false); setAccepted(false);
    try {
      const response = await fetch(`/api/admin/mail?folder=${folder}&id=${message.id}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to open mail');
      setDetail(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to open mail'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function send() {
    if (!detail || lock.current || accepted || !draft.trim()) return;
    if (!window.confirm(`Send this reply from info@frontier-devconsults.com to ${detail.replyTo}?`)) return;
    lock.current = true; setBusy(true); setAttempted(true); setError('');
    try {
      const response = await fetch('/api/admin/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detail.id, ticket: detail.ticket, to: detail.replyTo, text: draft }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sending could not be confirmed. Check Sent before retrying.');
      setAccepted(true); setNotice('Reply accepted by Resend. Check Sent for delivery status; acceptance is not confirmation of delivery.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Sending could not be confirmed. Check Sent before retrying.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function remove() {
    if (!detail || lock.current) return;
    if (draft && !accepted && !window.confirm('Delete this message from Business Mail and discard the unsaved reply?')) return;
    if ((!draft || accepted) && !window.confirm(`Delete “${detail.subject || '(no subject)'}” from Business Mail?`)) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/mail', { method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, id: detail.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to remove this message');
      setMessages(previous => previous.filter(message => message.id !== detail.id));
      setDetail(null); setDraft(''); setAttempted(false); setAccepted(false);
      setNotice('Message deleted from Business Mail. Copies in Resend or Gmail are unchanged.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove this message'); }
    finally { lock.current = false; setBusy(false); }
  }

  return <main className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-8">
    <div className="max-w-7xl mx-auto space-y-4">
      <Link href="/admin/dashboard" className="text-blue-700 underline">Back to dashboard</Link>
      <h1 className="text-2xl font-bold">Business Mail</h1>
      <p>info@frontier-devconsults.com · Gmail forwarding remains active.</p>
      <p className="text-sm text-gray-600">Messages are retrieved from Resend and subject to its retention limits. This is not a permanent archive. Sent includes automated mail and forwarded copies. Drafts are not saved. Delete removes a message from Business Mail only; copies in Resend or Gmail are unchanged.</p>
      <div className="flex gap-3">
        {['inbox', 'sent'].map(value => <button key={value} disabled={busy} aria-pressed={folder === value}
          className={`px-4 py-2 rounded border disabled:opacity-50 ${folder === value ? 'bg-blue-700 text-white' : 'bg-white'}`}
          onClick={() => { if (value !== folder && leaveDraft()) { setFolder(value); setMessages([]); setNext(null); setDetail(null); setDraft(''); setNotice(''); } }}>{value === 'inbox' ? 'Inbox' : 'Sent'}</button>)}
        <button disabled={busy} onClick={() => void load()} className="px-4 py-2 border rounded bg-white disabled:opacity-50">Refresh list</button>
      </div>
      {busy && <p role="status">Working…</p>}
      {error && <p role="alert" className="p-3 bg-red-50 text-red-800 border rounded">{error}</p>}
      {notice && <p role="status" className="p-3 bg-green-50 text-green-800 border rounded">{notice}</p>}
      <div className="grid lg:grid-cols-3 gap-4">
        <section aria-label="Messages" className="bg-white border rounded p-3 space-y-2">
          {!messages.length && !busy && <p>No messages on this page.</p>}
          {messages.map(message => <button key={message.id} disabled={busy} onClick={() => void open(message)} className="block w-full text-left border-b p-3 hover:bg-blue-50 disabled:opacity-50 break-words">
            <span className="block font-semibold">{message.subject || '(no subject)'}</span>
            <span className="block text-sm">{folder === 'inbox' ? message.from : message.to.join(', ')}</span>
            <span className="block text-xs text-gray-600">{message.created_at} {message.last_event ? `· ${message.last_event}` : ''}</span>
          </button>)}
          {next && <button disabled={busy} onClick={() => void load(next)} className="text-blue-700 underline">Load older messages</button>}
        </section>
        <section aria-label="Message details" className="lg:col-span-2 bg-white border rounded p-5 space-y-4 min-w-0">
          {!detail ? <p>Select a message.</p> : <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-bold break-words">{detail.subject || '(no subject)'}</h2>
              <button onClick={() => void remove()} disabled={busy} className="border border-red-300 text-red-700 px-3 py-2 rounded bg-white hover:bg-red-50 disabled:opacity-50">Delete</button>
            </div>
            <div className="text-sm break-words"><p>From: {detail.from}</p><p>To: {detail.to.join(', ')}</p><p>{detail.created_at}</p>{detail.last_event && <p>Status: {detail.last_event}</p>}</div>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm max-h-[32rem] overflow-auto">{detail.text || (detail.htmlOnly ? 'This message has HTML content only. Download the original to read it in your email application.' : '(No plain-text content)')}</pre>
            {detail.attachments.length > 0 && <div><h3 className="font-semibold">Attachments in original message</h3><ul className="list-disc pl-5">{detail.attachments.map((a, i) => <li key={i}>{a.filename} ({a.size} bytes)</li>)}</ul></div>}
            {folder === 'inbox' && <p><a href={`/api/admin/mail?id=${detail.id}&download=1`} className="text-blue-700 underline">Download original email (.eml), including attachments</a><span className="block text-xs text-gray-600">Maximum 10 MB. Treat attachments as untrusted. HTML and remote images are not rendered here.</span></p>}
            {folder === 'inbox' && (detail.replyTo && detail.ticket ? <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold">Reply as Frontier DevConsults</h3>
              <p className="break-words">Recipient: {detail.replyTo}</p>
              <p className="text-sm text-gray-600">Review the recipient: a sender can specify a different Reply-To address. This sends only to the address shown, not Reply All.</p>
              <label className="block">Your reply<textarea value={draft} onChange={e => setDraft(e.target.value)} disabled={attempted || busy} maxLength={20000} rows={8} className="mt-2 block w-full border rounded p-3 disabled:bg-gray-100" /></label>
              <button onClick={() => void send()} disabled={busy || accepted || !draft.trim()} className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">{accepted ? 'Accepted' : attempted ? 'Retry unchanged reply' : 'Send reply'}</button>
              {attempted && !accepted && <p className="text-sm">The draft is locked to prevent duplicate or changed retries. Check Sent before retrying. Opening a new reply creates a new send attempt.</p>}
            </div> : <p>Reply unavailable: recipient is ambiguous or reply configuration is missing.</p>)}
          </>}
        </section>
      </div>
    </div>
  </main>;
}

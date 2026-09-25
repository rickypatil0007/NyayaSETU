'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAudit() {
  const [documentName, setDocumentName] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    const createRes = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentName, documentText }),
    });
    const { audit, error } = await createRes.json();
    if (error) {
      alert(error);
      setLoading(false);
      return;
    }

    await fetch(`/api/audits/${audit.id}/run`, { method: 'POST' });
    router.push(`/audit/${audit.id}`);
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-semibold mb-6">New audit</h1>

      <label className="block text-sm font-medium mb-1">Document name</label>
      <input
        className="w-full mb-4 rounded-lg border border-slate-300 px-3 py-2"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
        placeholder="Founder Employment Agreement"
      />

      <label className="block text-sm font-medium mb-1">Document text</label>
      <textarea
        className="w-full h-64 mb-6 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
        value={documentText}
        onChange={(e) => setDocumentText(e.target.value)}
        placeholder="Paste the contract text here..."
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !documentText}
        className="rounded-lg bg-slate-900 text-white px-5 py-2.5 disabled:opacity-50"
      >
        {loading ? 'Running agents…' : 'Run audit'}
      </button>
    </main>
  );
}

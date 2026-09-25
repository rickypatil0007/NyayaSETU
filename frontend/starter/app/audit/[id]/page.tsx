import { supabaseAdmin } from '@/lib/supabase/client';

const STATUS_STYLES: Record<string, string> = {
  upheld: 'bg-red-100 text-red-800',
  dismissed: 'bg-green-100 text-green-800',
  escalated: 'bg-amber-100 text-amber-800',
  unresolved: 'bg-slate-100 text-slate-600',
};

export default async function AuditWorkspace({ params }: { params: { id: string } }) {
  const { data: audit } = await supabaseAdmin.from('audits').select('*').eq('id', params.id).single();
  const { data: findings } = await supabaseAdmin.from('findings').select('*').eq('audit_id', params.id);

  if (!audit) {
    return <main className="max-w-2xl mx-auto py-12 px-6">Audit not found.</main>;
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-semibold mb-1">{audit.document_name ?? 'Untitled document'}</h1>
      <p className="text-sm text-slate-500 mb-8">Status: {audit.status}</p>

      <div className="space-y-4">
        {(findings ?? []).map((f) => (
          <div key={f.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium">{f.claim}</p>
              <span className={`shrink-0 text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-1 ${STATUS_STYLES[f.status] ?? STATUS_STYLES.unresolved}`}>
                {f.status ?? 'unresolved'}
              </span>
            </div>

            {f.reasoning && <p className="mt-2 text-sm text-slate-600">{f.reasoning}</p>}

            {Array.isArray(f.citations) && f.citations.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                {f.citations.map((c: any, i: number) => (
                  <li key={i} className="text-xs text-slate-500">
                    <span className="font-medium">{c.source}</span>
                    {c.excerpt && <span> — {c.excerpt}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {(!findings || findings.length === 0) && (
          <p className="text-sm text-slate-500">
            {audit.status === 'complete' ? 'No concerns raised.' : 'Audit still running…'}
          </p>
        )}
      </div>
    </main>
  );
}

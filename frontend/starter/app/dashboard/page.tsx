import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/client';

export default async function Dashboard() {
  const { data: audits } = await supabaseAdmin
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Audits</h1>
        <Link href="/audit/new" className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
          New audit
        </Link>
      </div>

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {(audits ?? []).map((a) => (
          <li key={a.id}>
            <Link href={`/audit/${a.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <span>{a.document_name ?? 'Untitled document'}</span>
              <span className="text-xs uppercase tracking-wide text-slate-500">{a.status}</span>
            </Link>
          </li>
        ))}
        {(!audits || audits.length === 0) && (
          <li className="px-4 py-6 text-sm text-slate-500">No audits yet.</li>
        )}
      </ul>
    </main>
  );
}

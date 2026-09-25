import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/agents/orchestrator';
import { supabaseAdmin } from '@/lib/supabase/client';

// NOTE: this runs synchronously in one request. Fine for a hackathon demo
// with a handful of findings; if a run is slow on stage, show it running from
// a terminal (per the submission rules) rather than waiting on the UI.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: audit, error } = await supabaseAdmin
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  await supabaseAdmin.from('audits').update({ status: 'running' }).eq('id', audit.id);

  try {
    const state = await runAudit(audit.id, audit.document_text);

    const rows = state.findings.map((f) => {
      const verdict = state.verdicts.find((v) => v.findingId === f.id);
      return {
        id: f.id,
        audit_id: audit.id,
        claim: f.claim,
        citations: f.citations,
        status: verdict?.status ?? 'unresolved',
        reasoning: verdict?.reasoning ?? '',
      };
    });

    if (rows.length > 0) {
      await supabaseAdmin.from('findings').upsert(rows);
    }

    await supabaseAdmin.from('audits').update({ status: 'complete' }).eq('id', audit.id);

    return NextResponse.json({ state });
  } catch (err) {
    await supabaseAdmin.from('audits').update({ status: 'error' }).eq('id', audit.id);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

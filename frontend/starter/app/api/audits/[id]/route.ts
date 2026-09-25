import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: audit, error: auditErr } = await supabaseAdmin
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (auditErr || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  const { data: findings, error: findingsErr } = await supabaseAdmin
    .from('findings')
    .select('*')
    .eq('audit_id', params.id);

  if (findingsErr) return NextResponse.json({ error: findingsErr.message }, { status: 500 });

  return NextResponse.json({ audit, findings });
}

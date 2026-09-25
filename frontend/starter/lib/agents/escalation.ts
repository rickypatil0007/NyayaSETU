import { supabaseAdmin } from '../supabase/client';
import type { SupervisorVerdict } from './types';

export async function escalate(auditId: string, verdicts: SupervisorVerdict[]) {
  if (verdicts.length === 0) return;

  const rows = verdicts.map((v) => ({
    audit_id: auditId,
    finding_id: v.findingId,
    reason: v.reasoning,
    status: 'pending_human_review',
  }));

  const { error } = await supabaseAdmin.from('escalations').insert(rows);
  if (error) throw error;
}

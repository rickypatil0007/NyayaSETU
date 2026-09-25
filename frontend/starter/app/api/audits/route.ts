import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const { userId, documentName, documentText } = await req.json();

  if (!documentText) {
    return NextResponse.json({ error: 'documentText is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('audits')
    .insert({ user_id: userId, document_name: documentName, document_text: documentText })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ audit: data });
}

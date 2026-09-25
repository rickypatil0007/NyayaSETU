import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    // API serialization mapping: legacy DB uses 'status', but app uses 'execution_status'
    if (body.execution_status) {
      body.status = body.execution_status;
      delete body.execution_status;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )
    
    const { data, error } = await supabase
      .from('audits')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error("Supabase update audit error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Server API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // API serialization mapping
    if (body.execution_status) {
      body.status = body.execution_status;
      delete body.execution_status;
    }
    
    // Create a Supabase client with the SECRET key so it runs on the server
    // and bypasses Row Level Security (RLS) policies completely.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )
    
    const { data, error } = await supabase.from('audits').insert(body).select().single()
    
    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Server API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

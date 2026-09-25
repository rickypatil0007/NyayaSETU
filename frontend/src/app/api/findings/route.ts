import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // API serialization mapping
    if (body.review_status) {
      body.status = body.review_status;
      delete body.review_status;
    }
    
    // Bypass RLS using service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )
    
    const { data, error } = await supabase.from('findings').insert(body).select().single()
    
    if (error) {
      console.error("Supabase insert finding error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Server API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

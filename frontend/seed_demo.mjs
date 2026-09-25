import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htkughxcaxiluozxoewd.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || 'YOUR_SUPABASE_KEY_HERE' // Use service role key if possible

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seedDemoUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@nyayasetu.app',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo Auditor',
      role: 'Reviewer'
    }
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      console.log('Demo user already exists.')
    } else {
      console.error('Error creating demo user:', error)
    }
  } else {
    console.log('Demo user created successfully:', data.user.id)
  }
}

seedDemoUser()

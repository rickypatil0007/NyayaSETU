import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htkughxcaxiluozxoewd.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || 'YOUR_SUPABASE_KEY_HERE' // service role

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('documents', {
    public: true, // we can make it public for easier rendering or keep it private and use signed urls
    allowedMimeTypes: ['application/pdf', 'text/plain'],
    fileSizeLimit: 52428800
  })

  if (error) {
    console.error('Error creating bucket:', error)
  } else {
    console.log('Bucket created successfully:', data)
  }
}

createBucket()

import { createClient } from '@supabase/supabase-js';

// Anon client - safe for use in client components / RLS-protected reads.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Service-role client - server-side only (API routes). Bypasses RLS, so never
// import this from a client component.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

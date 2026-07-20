import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hasValidUrl = Boolean(supabaseUrl) && supabaseUrl !== 'your-project-url-here';

export const isSupabaseServerConfigured = () => hasValidUrl && Boolean(serviceRoleKey);

export const supabaseServer = isSupabaseServerConfigured()
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

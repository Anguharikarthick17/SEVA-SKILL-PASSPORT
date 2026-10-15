import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

let mockAdminClient: any = null;

export function setMockSupabaseServerAdminClient(client: any) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Security violation: Mock Supabase client injection is disabled in production.');
  }
  mockAdminClient = client;
}

export function getSupabaseServerAdminClient(): SupabaseClient<Database> | null {
  if (process.env.NODE_ENV !== 'production' && mockAdminClient) {
    return mockAdminClient;
  }

  if (typeof window !== 'undefined') {
    return null;
  }

  if (!isServerSupabaseConfigured) {
    return null;
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

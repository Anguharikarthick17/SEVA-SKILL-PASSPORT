import fs from 'fs';
import path from 'path';

// Load .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
} catch {}

import { createClient } from '@supabase/supabase-js';

async function diagnose() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log('NEXT_PUBLIC_SUPABASE_URL:', url);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', Boolean(anon));
  if (!url || !anon) return;
  const supabase = createClient(url, anon);

  // 1. Test non-existent user login
  const nonExistent = await supabase.auth.signInWithPassword({
    email: 'nonexistent-user-12345@seva.edu',
    password: 'Password123!',
  });
  console.log('Non-existent user error:', nonExistent.error?.message, 'code:', (nonExistent.error as any)?.code, 'status:', nonExistent.error?.status);

  // 2. Test demo learner login if registered in Supabase
  const demoAuth = await supabase.auth.signInWithPassword({
    email: 'arjun.sharma@example.gov.in',
    password: 'Password123!',
  });
  console.log('Demo user in Supabase error:', demoAuth.error?.message, 'status:', demoAuth.error?.status);

  // 3. Test signUp with a random test user to observe what Supabase returns for session and user
  const testEmail = `test-learner-${Date.now()}@gmail.com`;
  const signUpRes = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
  });
  console.log('SignUp result user:', Boolean(signUpRes.data?.user), 'session:', Boolean(signUpRes.data?.session), 'error:', signUpRes.error?.message);
  console.log('SignUp identities length:', signUpRes.data?.user?.identities?.length);
  console.log('SignUp confirmed_at:', signUpRes.data?.user?.email_confirmed_at);

  // 4. Test signInWithPassword with the user we just signed up!
  const signInNew = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'TestPassword123!',
  });
  console.log('SignIn immediately after signUp:', signInNew.data?.user ? 'SUCCESS' : 'FAILED', 'error:', signInNew.error?.message);

  // 5. Check if profiles table is accessible
  const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, full_name, email, created_at');
  console.log('Profiles in Supabase:', JSON.stringify(profilesData, null, 2));
}

diagnose().catch(console.error);

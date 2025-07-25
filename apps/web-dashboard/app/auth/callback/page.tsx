import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string };
}) {
  const supabase = createSupabaseServerClient();

  if (searchParams.error) {
    console.error('Auth error:', searchParams.error);
    redirect('/login?error=auth_error');
  }

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    
    if (error) {
      console.error('Session exchange error:', error);
      redirect('/login?error=session_error');
    }
  }

  // Successful authentication - redirect to app
  redirect('/app');
}
import { createClient } from '@/lib/supabase/server';
import { LandingPage } from '@/components/auth/LandingPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  return <Dashboard />;
}

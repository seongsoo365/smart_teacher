import { AuthPage } from '@/components/auth/AuthPage';

interface Props {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function AuthRoute({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <AuthPage
      redirectTo={params.redirectTo ?? '/'}
      hasError={params.error === 'oauth'}
    />
  );
}

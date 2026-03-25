'use client';

export const dynamic = 'force-dynamic';

import { AuthProvider, useAuth } from './_components/AuthProvider';
import BottomNav from './_components/BottomNav';

function Inner({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  return (
    <>
      {children}
      {!loading && session && <BottomNav />}
    </>
  );
}

export default function TheSecretIngredientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Inner>{children}</Inner>
    </AuthProvider>
  );
}

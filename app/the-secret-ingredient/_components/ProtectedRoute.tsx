'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../_lib/supabase';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<object | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/the-secret-ingredient/login');
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data ?? null));
  }, [session]);

  if (loading || (session && profile === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access restricted</h2>
          <p className="text-gray-500 text-sm">
            You need an invitation to access this app. Please contact the admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

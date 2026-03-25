'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../_lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.replace('/the-secret-ingredient');
      });
    } else {
      router.replace('/the-secret-ingredient');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-gray-500">Signing you in…</p>
    </div>
  );
}

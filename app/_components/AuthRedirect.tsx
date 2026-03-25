'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash.includes('access_token=')) {
      router.replace('/the-secret-ingredient' + window.location.hash);
    }
  }, [router]);

  return null;
}

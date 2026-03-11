'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OAuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      const callBridge = async () => {
        attempts.current += 1;
        try {
          const res = await fetch('/api/auth/oauth-bridge');
          const data = await res.json();

          if (data.success) {
            localStorage.setItem('token', data.data.token);
            window.location.href = '/dashboard';
          } else if (attempts.current < 5) {
            setTimeout(callBridge, 1000);
          } else {
            router.push('/login');
          }
        } catch {
          if (attempts.current < 5) {
            setTimeout(callBridge, 1000);
          } else {
            router.push('/login');
          }
        }
      };

      setTimeout(callBridge, 500);
    }
  }, [session, status, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f0f 50%, #000000 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
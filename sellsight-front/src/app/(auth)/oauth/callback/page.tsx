'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import type { OAuthProvider } from '@shared/types';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const provider = searchParams.get('provider') as OAuthProvider | null;

    if (!code || !provider) {
      toast.error('OAuth login failed — missing parameters');
      router.replace('/login');
      return;
    }

    const redirectUri = `${window.location.origin}/oauth/callback?provider=${provider}`;

    authApi
      .oauthLogin({ provider, code, redirectUri })
      .then((data) => {
        login(data);
        toast.success(`Welcome, ${data.firstName}!`);
        if (data.role === 'ADMIN') router.replace('/admin/orders');
        else if (data.role === 'SELLER') router.replace('/seller/dashboard');
        else router.replace('/products');
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'OAuth login failed';
        toast.error(msg);
        router.replace('/login');
      });
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 rounded-full border-2 border-[#111]/20 border-t-[#111]"
          style={{ animation: 'spin 0.65s linear infinite' }}
        />
        <p className="text-sm text-[#666]">Completing sign-in...</p>
      </div>
    </div>
  );
}

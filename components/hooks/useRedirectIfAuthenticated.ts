'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../auth/authStore';

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      router.push('/dashboard'); // Перенаправляем на /dashboard
    }
  }, [accessToken, router]);
};

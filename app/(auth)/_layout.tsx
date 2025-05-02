import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(app)');
    }
  }, [user, loading]);

  if (loading || user) {
    return null;
  }

  return <Slot />;
}
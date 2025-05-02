import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { SplashScreen } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
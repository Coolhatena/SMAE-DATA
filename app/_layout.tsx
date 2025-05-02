import React from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { AuthProvider } from '../lib/auth';

// Prevenir que la pantalla de carga automática se oculte
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
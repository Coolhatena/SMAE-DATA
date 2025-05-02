// app/(auth)/Login.tsx
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '@/components/AuthForm';

export default function Login() {
  const router = useRouter();

  const handleForgotPassword = () => {
    router.push('/(auth)/forgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AuthForm mode="signIn" />

        <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <Link href="/(auth)/Register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});
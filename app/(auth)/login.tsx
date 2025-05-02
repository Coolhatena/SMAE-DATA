import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function signInWithEmail(): Promise<void> {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error: any) {
      Alert.alert('Error de inicio de sesión', error.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail(): Promise<void> {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      Alert.alert('Registro exitoso', 'Por favor verifica tu correo electrónico');
    } catch (error: any) {
      Alert.alert('Error de registro', error.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <Button
        title={loading ? "Cargando..." : "Iniciar Sesión"}
        onPress={signInWithEmail}
        disabled={loading}
      />
      
      <View style={styles.separator} />
      
      <Button
        title={loading ? "Cargando..." : "Registrarse"}
        onPress={signUpWithEmail}
        disabled={loading}
      />
      
      {loading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  separator: {
    height: 20,
  },
  loader: {
    marginTop: 20,
  },
});
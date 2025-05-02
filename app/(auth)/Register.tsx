import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/AuthForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Register() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="food-apple" size={48} color="#3498db" />
          <Text style={styles.brandName}>EasySMAE</Text>
          <Text style={styles.brandTagline}>Nutrición simplificada</Text>
        </View>

        <View style={styles.formContainer}>
          <AuthForm mode="signUp" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Inicia sesión</Text>
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
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});
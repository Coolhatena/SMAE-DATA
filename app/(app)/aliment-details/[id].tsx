import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import SmaeInterface from '@/app/interfaces/smaeInterface';
import { useAuth } from '@/lib/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DetallesAlimento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [alimento, setAlimento] = useState<SmaeInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    fetchAlimentoDetails();
    if (user) {
      checkIfFavorite();
    }
  }, [id, user]);

  const fetchAlimentoDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smae')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setAlimento(data);
      } else {
        setError('No se encontró el alimento.');
      }
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError('Ocurrió un error al cargar los detalles.');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('aliment_id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 its "No results found"
        console.error('Error al verificar favorito:', error);
      } else {
        setIsFavorite(!!data);
      }
    } catch (err) {
      console.error('Error al verificar favorito:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !id || !alimento) return;
    
    setFavoritesLoading(true);
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('aliment_id', id);

        if (error) throw error;
        setIsFavorite(false);
        Alert.alert('Éxito', `"${alimento.alimento}" eliminado de tus favoritos`);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, aliment_id: id }]);

        if (error) throw error;
        setIsFavorite(true);
        Alert.alert('Éxito', `"${alimento.alimento}" añadido a tus favoritos`);
      }
    } catch (error: any) {
      Alert.alert('Error', `No se pudo ${isFavorite ? 'eliminar de' : 'añadir a'} favoritos: ${error.message}`);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const NutrientItem = ({ label, value, unit = '' }: { label: string; value: string; unit?: string }) => {
    if (!value || value === '0' || value === '-') return null;
    
    return (
      <View style={styles.nutrientItem}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>
          {value} {unit}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (error || !alimento) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error || 'No se pudo cargar la información.'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.favoriteButton, favoritesLoading && styles.disabledButton]}
            onPress={toggleFavorite}
            disabled={favoritesLoading}
          >
            {favoritesLoading ? (
              <ActivityIndicator size="small" color="#e74c3c" />
            ) : (
              <MaterialCommunityIcons 
                name={isFavorite ? "star" : "star-outline"} 
                size={24} 
                color={isFavorite ? "#e74c3c" : "#777"} 
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Main info */}
        <View style={styles.mainInfoContainer}>
          <Text style={styles.alimentoName}>{alimento.alimento}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{alimento.categoria}</Text>
          </View>

          <View style={styles.servingInfo}>
            <View style={styles.servingDetail}>
              <Text style={styles.servingLabel}>Cantidad</Text>
              <Text style={styles.servingValue}>
                {parseFloat(alimento.cantidad) >= 1 
                  ? parseFloat(alimento.cantidad) 
                  : parseFloat(alimento.cantidad).toFixed(2)}
              </Text>
            </View>
            <View style={styles.servingDetail}>
              <Text style={styles.servingLabel}>Unidad</Text>
              <Text style={styles.servingValue}>{alimento.unidad}</Text>
            </View>
            <View style={styles.servingDetail}>
              <Text style={styles.servingLabel}>Peso neto</Text>
              <Text style={styles.servingValue}>{alimento.peso_neto} g</Text>
            </View>
          </View>
        </View>

        {/* Macronutrients */}
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{alimento.kcal}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{alimento.proteina}</Text>
            <Text style={styles.macroLabel}>Proteína (g)</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{alimento.lipidos}</Text>
            <Text style={styles.macroLabel}>Lípidos (g)</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{alimento.carbohidratos}</Text>
            <Text style={styles.macroLabel}>Carbs (g)</Text>
          </View>
        </View>

        {/* Nutritional Info */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Información Nutricional</Text>
          
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionSubtitle}>Grasas</Text>
            <NutrientItem label="Grasa Saturada" value={alimento.grasa_saturada} unit="g" />
            <NutrientItem label="Grasa Monoinsaturada" value={alimento.grasa_monoinsaturada} unit="g" />
            <NutrientItem label="Grasa Poliinsaturada" value={alimento.grasa_poliinsaturada} unit="g" />
            <NutrientItem label="Colesterol" value={alimento.colesterol} unit="mg" />
          </View>
          
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionSubtitle}>Carbohidratos</Text>
            <NutrientItem label="Azúcares" value={alimento.azucar} unit="g" />
            <NutrientItem label="Fibra" value={alimento.fibra} unit="g" />
            <NutrientItem label="Índice Glucémico (IG)" value={alimento.IG} />
            <NutrientItem label="Índice de Carga (IC)" value={alimento.IC} />
          </View>
          
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionSubtitle}>Vitaminas</Text>
            <NutrientItem label="Vitamina A" value={alimento.vitamina_a} unit="μg" />
            <NutrientItem label="Vitamina C" value={alimento.vitamina_c} unit="mg" />
            <NutrientItem label="Ácido Fólico" value={alimento.acido_folico} unit="μg" />
          </View>
          
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionSubtitle}>Minerales</Text>
            <NutrientItem label="Calcio" value={alimento.calcio} unit="mg" />
            <NutrientItem label="Hierro" value={alimento.hierro} unit="mg" />
            <NutrientItem label="Potasio" value={alimento.potasio} unit="mg" />
            <NutrientItem label="Sodio" value={alimento.sodio} unit="mg" />
            <NutrientItem label="Fósforo" value={alimento.fosforo} unit="mg" />
            <NutrientItem label="Selenio" value={alimento.selenio} unit="μg" />
          </View>
          
          {alimento.etanol && alimento.etanol !== '0' && (
            <View style={styles.nutritionSection}>
              <Text style={styles.nutritionSubtitle}>Otros</Text>
              <NutrientItem label="Etanol" value={alimento.etanol} unit="g" />
            </View>
          )}
        </View>
        
        {/* Aditional info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Información Adicional</Text>
          <NutrientItem label="Peso Bruto" value={alimento.peso_bruto} unit="g" />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#3498db',
    fontWeight: '600',
  },
  favoriteButton: {
	width: 44,
	height: 44,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#f0f0f0',
	borderRadius: 22,
  },
  disabledButton: {
	opacity: 0.7
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  mainInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alimentoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#e8f4fd',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  servingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  servingDetail: {
    alignItems: 'center',
    flex: 1,
  },
  servingLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  servingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
  nutritionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  nutritionSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutritionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 10,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  additionalInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
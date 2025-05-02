import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image 
} from 'react-native';
import { useAuth } from '../../lib/auth';
import SmaeInterface from '../interfaces/smaeInterface';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [alimentos, setAlimentos] = useState<SmaeInterface[]>([]);
  const [dataError, setDataError] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAlimentos();
  }, []);
  
  const loadAlimentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("smae").select("*").limit(20);
      if (error) {
        setDataError(error.message);
        console.log("Supabase error:", error.details);
      } else {
        setAlimentos(data ?? []);
      }
    } catch (error) {
      console.log("Network or unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAlimentos();
  };

  const navigateToDetails = (id: string) => {
    router.push(`/(app)/aliment-details/${id}`);
  };
  
  const renderItem = ({ item, index }: { item: SmaeInterface, index: number }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, index % 2 === 0 ? styles.evenItem : styles.oddItem]}
      onPress={() => console.log("Seleccionaste:", item.alimento)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.alimento}</Text>
          {item.categoria && (
            <Text style={styles.itemCategory}>{item.categoria}</Text>
          )}
        </View>
        <View style={styles.itemDetails}>
          {item.cantidad && (
            <Text style={styles.itemQuantity}>Cantidad: {item.cantidad}</Text>
          )}
          <TouchableOpacity 
		  	style={styles.infoButton} 
			onPress={() => navigateToDetails(item.id)}
			>
            <Text style={styles.infoButtonText}>Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando alimentos...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {alimentos.length !== 0 ? (
          <FlatList
            ListHeaderComponent={
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Lista de Alimentos</Text>
                  <Text style={styles.headerSubtitle}>Búsqueda básica</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                  <Text style={styles.refreshButtonText}>↻ Refrescar</Text>
                </TouchableOpacity>
              </View>
            }
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => item.id}
            data={alimentos}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay alimentos disponibles</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {alimentos.length} alimentos encontrados
                </Text>
                <TouchableOpacity 
                  style={styles.signOutButton}
                  onPress={signOut}
                >
                  <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error al cargar datos</Text>
            <Text style={styles.errorMessage}>{dataError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    borderRadius: 10,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  evenItem: {
    backgroundColor: '#fff',
  },
  oddItem: {
    backgroundColor: '#f7fbff',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  infoButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>¡Bienvenido!</Text>
//       <Text style={styles.subtitle}>Correo: {user?.email}</Text>
//       <Button title="Cerrar Sesión" onPress={signOut} />
//     </View>
//   );
// }
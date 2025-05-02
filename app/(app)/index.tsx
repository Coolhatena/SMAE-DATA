import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import SmaeInterface from '../interfaces/smaeInterface';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [alimentos, setAlimentos] = useState<SmaeInterface[]>([]);
  const [dataError, setDataError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    loadAlimentos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (searching) {
        loadAlimentos();
        setSearching(false);
      }
      return;
    }
    
    const debounceTimeout = setTimeout(() => {
      searchAlimentos(searchQuery);
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);
  
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

  const searchAlimentos = async (query: string) => {
    setLoading(true);
    setSearching(true);
    
    try {
      const { data, error } = await supabase
        .from("smae")
        .select("*")
        .ilike("alimento", `%${query}%`);
      
      if (error) {
        setDataError(error.message);
        console.log("Supabase search error:", error.details);
      } else {
        setAlimentos(data ?? []);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (searchQuery.trim() !== "") {
      searchAlimentos(searchQuery);
    } else {
      loadAlimentos();
    }
  };
  
  const navigateToDetails = (id: string) => {
    router.push(`/(app)/aliment-details/${id}`);
  };

  const handleSignOut = () => {
    signOut();
  };
  
  const renderItem = ({ item, index }: { item: SmaeInterface, index: number }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, index % 2 === 0 ? styles.evenItem : styles.oddItem]}
      onPress={() => navigateToDetails(item.id)}
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
			// If value is less than 1, show only 2 decimals to prevent ugly periodic number to be displayed (Like 0.33333...)
            <Text style={styles.itemQuantity}>{parseFloat(item.cantidad) >= 1 ? parseFloat(item.cantidad) : parseFloat(item.cantidad).toFixed(2)} {item.unidad}</Text>
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

  if (loading && !alimentos.length) {
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
        <View style={styles.topNav}>
		  	<View style={styles.searchBarContainer}>
				<MaterialCommunityIcons name="magnify" size={20} color="#333" style={{ marginRight: 8 }} />
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar alimento..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					clearButtonMode="while-editing"
					returnKeyType="search"
					onSubmitEditing={Keyboard.dismiss}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity 
					style={styles.clearSearchButton}
					onPress={() => setSearchQuery("")}
					>
					<MaterialCommunityIcons name="close-circle" size={18} color="#777" />
					</TouchableOpacity>
				)}
			</View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        
        {alimentos.length !== 0 ? (
          <FlatList
            ListHeaderComponent={
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Lista de Alimentos</Text>
                  <Text style={styles.headerSubtitle}>
                    {searching ? `Búsqueda: "${searchQuery}"` : "Alimentos destacados"}
                  </Text>
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
                <Text style={styles.emptyText}>
                  {searching 
                    ? `No se encontraron alimentos que coincidan con "${searchQuery}"` 
                    : "No hay alimentos disponibles"}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {alimentos.length} {searching ? 'resultados encontrados' : 'alimentos mostrados'}
                </Text>
              </View>
            }
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              {searching 
                ? `No se encontraron resultados para "${searchQuery}"` 
                : "Error al cargar datos"}
            </Text>
            <Text style={styles.errorMessage}>
              {searching ? "Intenta con otros términos de búsqueda" : dataError}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>
                {searching ? "Reiniciar búsqueda" : "Reintentar"}
              </Text>
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  searchBarContainer: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
	justifyContent: "space-between",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 20,
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
    textAlign: 'center',
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
    textAlign: 'center',
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
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../lib/auth';
import SmaeInterface from '../interfaces/smaeInterface';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [alimentos, setAlimentos] = useState<SmaeInterface[]>([]);
	const [dataError, setDataError] = useState("");
  
	useEffect(() => {
	  loadAlimentos();
	}, []);
  
	const loadAlimentos = async () => {
	  try {
		const { data, error } = await supabase.from("smae").select("*").limit(4);
		if (error) {
		  setDataError(error.message);
		  console.log("Supabase error:", error.details);
		} else {
		  setAlimentos(data ?? []);
		}
	  } catch (error) {
		console.log("Network or unexpected error:", error);
	  }
	};
  
	return (
	  <View
		style={styles.container}
	  >
		{alimentos.length !== 0 ? (
		  <FlatList
			ListHeaderComponent={
			  <View style={{ marginBottom: 20 }}>
				<Text style={{ fontSize: 25, textTransform: "uppercase" }}>
				  Lista de alimentos
				</Text>
				<Text>Búsqueda básica</Text>
			  </View>
			}
			keyExtractor={(item) => item.id}
			data={alimentos}
			renderItem={({ item }) => (
			  <Text style={{ fontSize: 20, fontWeight: "thin" }}>
				{item.alimento}
			  </Text>
			)}
		  />
		) : (
		  <>
			<Text>Error</Text>
			<Text>{dataError}</Text>
		  </>
		)}
	  </View>
	);
  }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>¡Bienvenido!</Text>
//       <Text style={styles.subtitle}>Correo: {user?.email}</Text>
//       <Button title="Cerrar Sesión" onPress={signOut} />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
});
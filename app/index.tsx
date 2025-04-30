import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { supabase } from "./helper/supabase";
import { SmaeInterface } from "./interfaces/smaeInterface";

export default function Index() {
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
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
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

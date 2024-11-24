import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
} from "react-native";

export default function Index() {
  interface Planet {
    id: number;
    name: string;
    description: string;
    moons: number;
    moon_names: string[] | undefined;
    image: string;
  }

  const baseUrl = "http://161.35.143.238:8000/mruiz";
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null); // Planeta seleccionado
  const [isAdding, setIsAdding] = useState(false); // Modo agregar/editar
  const [form, setForm] = useState({
    name: "",
    description: "",
    moons: 0,
    moon_names: [],
    image: "",
  });
  const [originalPlanets, setOriginalPlanets] = useState<Planet[]>([]);

  // Obtener planetas desde el backend al cargar el componente
  useEffect(() => {
    fetch(baseUrl, {
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPlanets(data);
        setOriginalPlanets(data);
      })
      .catch((error) => console.error("Error al obtener los planetas:", error));
  }, []);

  // Función para ordenar por cantidad de lunas (mayor a menor)
  const sortByMoons = () => {
    const sortedPlanets = [...planets].sort((a, b) => b.moons - a.moons);
    setPlanets(sortedPlanets);
  };

  // Función para restablecer el orden original
  const resetOrder = () => {
    setPlanets(originalPlanets);
  };

  // Función para manejar el formulario
  const handleFormChange = (field: keyof typeof form, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const renderMoons = (moons: string[] | undefined) => {
    return moons && moons.length > 0 ? moons.join(", ") : "Ninguna";
  };

  // Agregar o editar planeta
  const savePlanet = () => {
    const method = currentPlanet ? "PUT" : "POST";
    const url = currentPlanet ? `${baseUrl}/${currentPlanet.id}` : baseUrl;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        moons: form.moons,
        moon_names: form.moon_names,
        image: form.image,
      }),
    })
      .then((response) => response.json())
      .then((savedPlanet) => {
        if (currentPlanet) {
          // Actualizar planeta existente
          setPlanets((prev) =>
            prev.map((planet) =>
              planet.id === currentPlanet.id ? savedPlanet : planet
            )
          );
        } else {
          // Agregar nuevo planeta
          setPlanets((prev) => [...prev, savedPlanet]);
        }
        setForm({ name: "", description: "", moons: 0, moon_names: [], image: "" });
        setCurrentPlanet(null);
        setIsAdding(false);
      })
      .catch((error) => console.error("Error al guardar el planeta:", error));
  };

  // Eliminar planeta
  const deletePlanet = (id: number) => {
    fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    })
      .then(() => {
        setPlanets((prev) => prev.filter((planet) => planet.id !== id));
        setCurrentPlanet(null);
      })
      .catch((error) => console.error("Error al eliminar el planeta:", error));
  };

  // Volver a la lista
  const goBack = () => {
    setCurrentPlanet(null);
    setIsAdding(false);
  };

  return (
    <View style={styles.container}>
      {/* Pantalla de listado de planetas */}
      {!currentPlanet && !isAdding && (
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Planetario UCU</Text>

          {/* Botones: Ordenar/Restablecer y Agregar */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => setIsAdding(true)}
            >
              <Text style={styles.buttonText}>Agregar Planeta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.sortButton]}
              onPress={
                planets.length > 0 && planets[0].id !== originalPlanets[0].id
                  ? resetOrder
                  : sortByMoons
              }
            >
              <Text style={styles.buttonText}>
                {planets.length > 0 && planets[0].id !== originalPlanets[0].id
                  ? "Restablecer Orden"
                  : "Ordenar por Lunas"}
              </Text>
            </TouchableOpacity>
          </View>


          {/* Lista de planetas */}
          <FlatList
            data={planets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: { item: Planet }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setCurrentPlanet(item)} // Navega a los detalles
              >
                <Image source={{ uri: item.image }} style={styles.planetImage} />
                <Text style={styles.planetTitle}>{item.name}</Text>

              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />

        </View>
      )}

      {/* Pantalla de detalles del planeta */}
      {currentPlanet && !isAdding && (
        <ScrollView>
          <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
            <Text style={[styles.title, { fontSize: 28 }]}>Detalles del Planeta</Text>
            <Image source={{ uri: currentPlanet.image }} style={styles.planetDetailsImage} />
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Nombre:</Text> {currentPlanet.name}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Descripción:</Text> {currentPlanet.description}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Número de lunas:</Text> {currentPlanet.moons}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Lunas:</Text> {renderMoons(currentPlanet.moon_names)}
            </Text>

            {/* Botón para eliminar */}
            <TouchableOpacity onPress={() => deletePlanet(currentPlanet.id)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>

            {/* Botón para volver */}
            <TouchableOpacity onPress={goBack} style={[styles.button, styles.addButton]}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}



      {/* Pantalla para agregar/editar planeta */}
      {isAdding && (
        <ScrollView>
          <View>
            <Text style={styles.title}>
              {currentPlanet ? "Editar Planeta" : "Agregar Planeta"}
            </Text>
            <TextInput
              placeholder="Nombre"
              value={form.name}
              onChangeText={(text) => handleFormChange("name", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Descripción"
              value={form.description}
              onChangeText={(text) => handleFormChange("description", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Número de lunas"
              value={form.moons.toString()}
              onChangeText={(text) => handleFormChange("moons", parseInt(text) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Nombres de las lunas (separadas por comas)"
              value={form.moon_names.join(", ")}
              onChangeText={(text) =>
                handleFormChange(
                  "moon_names",
                  text.split(",").map((name) => name.trim())
                )
              }
              style={styles.input}
            />
            <TextInput
              placeholder="URL de la imagen"
              value={form.image}
              onChangeText={(text) => handleFormChange("image", text)}
              style={styles.input}
            />
            <TouchableOpacity onPress={savePlanet}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goBack}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e2f7fc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 8,
    width: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    textAlign: "center",
  },
  planetItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3d88e9",
  },
  planetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  planetDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  planetImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  planetName: {
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  sortButton: {
    backgroundColor: "green",
  },
  addButton: {
    backgroundColor: "blue",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "green",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "red",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "red",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "gray",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  planetDetailsImage: {
    width: 200, // Imagen más grande
    height: 200,
    borderRadius: 100, // Redonda
    marginBottom: 20,
  },
  detailText: {
    fontSize: 18, // Texto más grande
    marginBottom: 10,
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold", // Texto en negrita
  },
});

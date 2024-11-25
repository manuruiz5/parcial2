import React, { useState, useEffect } from "react";
import {View,Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Platform,ScrollView } from "react-native";

export default function Index() {
  interface Equipo {
    id: number;
    name: string;
    description: string;
    goals: number;
    points: number;
    image: string;
  }

  const baseUrl = "http://161.35.143.238:8000/mruiz";
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [currentEquipo, setCurrentEquipo] = useState<Equipo | null>(null); // Equipo seleccionado
  const [isAdding, setIsAdding] = useState(false); // Modo agregar/editar
  const [form, setForm] = useState<{
    name: string;
    description: string;
    goals: number;
    points: number;
    image: string;
  }>({
    name: "",
    description: "",
    goals: 0,
    points: 0,
    image: "",
  });

  const [originalEquipos, setOriginalEquipos] = useState<Equipo[]>([]);

  // Obtener Equipo desde el backend al cargar el componente
  useEffect(() => {
    fetch(baseUrl, {
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setEquipos(data);
        setOriginalEquipos(data);
      })
      .catch((error) => console.error("Error al obtener los planetas:", error));
  }, []);

  // Función para ordenar por cantidad de puntos (mayor a menor)
  const sortByPoints = () => {
    const sortedEquipos = [...equipos].sort((a, b) => b.points - a.points);
    setEquipos(sortedEquipos);
  };

  // Función para restablecer el orden original
  const resetOrder = () => {
    setEquipos(originalEquipos);
  };

  // Función para manejar el formulario
  const handleFormChange = (field: keyof typeof form, value: any) => {
    setForm({ ...form, [field]: value });
  };
/*
  const renderPoints = (moons: number) => {
    return moons && moons.length > 0 ? moons.join(", ") : "Ninguno";
  };
*/
  // Agregar o editar planeta
  const saveEquipo = () => {
    const method = currentEquipo ? "PUT" : "POST";
    const url = currentEquipo ? `${baseUrl}/${currentEquipo.id}` : baseUrl;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        goals: form.goals,
        points: form.points,
        image: form.image,
      }),
    })
      .then((response) => response.json())
      .then((savedEquipo) => {
        if (currentEquipo) {
          // Editar equipo existente
          setEquipos((prev) =>
            prev.map((equipo) =>
              equipo.id === currentEquipo.id ? savedEquipo : equipo
            )
          );
          setOriginalEquipos((prev) =>
            prev.map((equipo) =>
              equipo.id === currentEquipo.id ? savedEquipo : equipo
            )
          );
        } else {
          // Agregar nuevo equipo
          setEquipos((prev) => [...prev, savedEquipo]);
          setOriginalEquipos((prev) => [...prev, savedEquipo]);
        }
        setForm({ name: "", description: "", goals: 0, points: 0, image: "" });
        setCurrentEquipo(null);
        setIsAdding(false);
      })

      .catch((error) => console.error("Error al guardar el equipo:", error));
  };

  // Eliminar equipo
  const deleteEquipo = (id: number) => {
    fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    })
      .then(() => {
        setEquipos((prev) => prev.filter((equipo) => equipo.id !== id));
        setOriginalEquipos((prev) =>
          prev.filter((equipo) => equipo.id !== id)
        );
        setCurrentEquipo(null);
      })
      .catch((error) => console.error("Error al eliminar el equipo:", error));
  };

  // Volver a la lista
  const goBack = () => {
    setCurrentEquipo(null);
    setIsAdding(false);
  };

  return (
    <View style={styles.container}>
      {!currentEquipo && !isAdding && (
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Eliminatorias del mundial</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[
                styles.button,
                Platform.OS === "android"
                  ? styles.androidAddButton
                  : styles.iosAddButton,
              ]}
              onPress={() => {
                setForm({
                  name: "",
                  description: "",
                  goals: 0,
                  points: 0,
                  image: "",
                });
                setIsAdding(true);
              }}
            >
              <Text
                style={
                  Platform.OS === "android"
                    ? styles.androidAddButtonText
                    : styles.iosAddButtonText
                }
              >
                {Platform.OS === "android" ? "Nuevo Equipo" : "Crear Equipo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.sortButton]}
              onPress={
                equipos.length > 0 && equipos[0].id !== originalEquipos[0].id
                  ? resetOrder
                  : sortByPoints
              }
            >
              <Text style={styles.buttonText}>
                {equipos.length > 0 && equipos[0].id !== originalEquipos[0].id
                  ? "Restablecer Orden"
                  : "Ordenar por Puntos"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de equipos */}
          <FlatList
            data={equipos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: { item: Equipo }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setCurrentEquipo(item)} // Navega a los detalles
              >
                <Image source={{ uri: item.image }} style={styles.equipoImage} />
                <Text style={styles.equipoTitle}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {/* Pantalla de detalles del planeta */}
      {currentEquipo && !isAdding && (
        <ScrollView>
          <View style={styles.detailsContainer}>
            {/* Botón de volver */}
            <TouchableOpacity
              style={[styles.backButton, styles.addButton]}
              onPress={goBack}
            >
              <Text style={styles.buttonText}>Atrás</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { fontSize: 28 }]}>
              Detalles del Equipo
            </Text>

            <Image
              source={{ uri: currentEquipo.image }}
              style={styles.equipoDetailsImage}
            />

            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Nombre:</Text> {currentEquipo.name}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Descripción:</Text>{" "}
              {currentEquipo.description}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Número de goles:</Text>{" "}
              {currentEquipo.goals}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Puntos:</Text>{" "}
              {currentEquipo.points}
            </Text>

            {/* Botón de editar */}
            <TouchableOpacity
              onPress={() => {
                setForm({
                  name: currentEquipo.name || "",
                  description: currentEquipo.description || "",
                  goals: currentEquipo.goals || 0,
                  points: currentEquipo.points || 0,
                  image: currentEquipo.image || "",
                });
                setIsAdding(true);
              }}
              style={[styles.submitButton, styles.editButton]}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            {/* Botón de eliminar */}
            <TouchableOpacity
              onPress={() => deleteEquipo(currentEquipo.id)}
              style={[styles.submitButton, styles.deleteButton]}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Pantalla para agregar/editar equipo */}
      {isAdding && (
        <ScrollView>
          <View style={styles.addEquipoContainer}>
            <TouchableOpacity
              style={[styles.backButton, styles.addButton]}
              onPress={goBack}
            >
              <Text style={styles.buttonText}>Atrás</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {currentEquipo ? "Editar Equipo" : "Agregar Equipo"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.name}
              onChangeText={(value) => handleFormChange("name", value)}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Descripción"
              value={form.description}
              onChangeText={(value) => handleFormChange("description", value)}
              multiline={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de goles"
              value={form.goals.toString()}
              onChangeText={(value) =>
                handleFormChange("goals", parseInt(value) || 0)
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Número de puntos"
              value={form.points.toString()}
              onChangeText={(value) =>
                handleFormChange("points", parseInt(value) || 0)
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="URL de la imagen"
              value={form.image}
              onChangeText={(value) => handleFormChange("image", value)}
            />

            <TouchableOpacity
              style={[styles.submitButton, styles.addButton]}
              onPress={saveEquipo}
            >
              <Text style={styles.buttonText}>Guardar</Text>
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
  buttonsRow: {
    flexDirection: "row",
    justifyContent: Platform.OS === "ios" ? "flex-end" : "space-between",
    marginBottom: 10,
    alignItems: "center",
    padding: 16,
  },
  button: {
    padding: 10,
    borderRadius: 5,
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
  androidAddButton: {
    backgroundColor: "blue",
    alignSelf: "flex-start", 
    padding: 10,
    borderRadius: 5,
    
  },
  iosAddButton: {
    backgroundColor: "green",
    alignSelf: "flex-end", 
    padding: 10,
    borderRadius: 5,
    marginRight: 20,
  },
  androidAddButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", 
  },
  iosAddButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", 
    alignSelf: "flex-end",
  },

  equipoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  equipoImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
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
    alignSelf: "flex-start", 
  },
  saveButton: {
    backgroundColor: "green",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "green", 
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  
  submitButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
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
    marginBottom: 15,
  },
  equipoDetailsImage: {
    width: 200, 
    height: 200,
    borderRadius: 100, 
    marginBottom: 20,
  },
  detailText: {
    fontSize: 18, 
    marginBottom: 10,
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold", 
  },
  addEquipoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e2f7fc", 
  },
  detailCard: {
    backgroundColor: "#fff", 
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
});
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// ⚠️ REEMPLAZA ESTO CON TU DIRECCIÓN IPV4 QUE SACASTE DEL IPCONFIG
const API_URL = 'http://192.168.18.3:8000/predict';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Función para seleccionar o tomar la foto
  const seleccionarImagen = async () => {
    // Solicitar permisos de la galería/cámara
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para analizar al perrito.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Habilita el recorte previo en el celular
      aspect: [1, 1],      // Cuadrado perfecto para mejorar la eficiencia
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setResultado(null);
      await enviarABackend(uri);
    }
  };

  // Enviar el archivo mediante FormData al Backend de Python
  const enviarABackend = async (uri) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: 'photo.jpg',
      type: 'image/jpeg', // Formato estándar compatible con OpenCV
    });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setResultado(data);
      } else {
        Alert.alert('Error de IA', data.message || 'No se pudo procesar.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el backend. Verifica la IP y la red Wi-Fi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analizador de Emociones Caninas 🐾</Text>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TouchableOpacity style={styles.button} onPress={seleccionarImagen} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Analizando con IA...' : 'Seleccionar Foto'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

      {resultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Veredicto de la Red Neuronal:</Text>
          <Text style={styles.resultText}>Estado: {resultado.emotion}</Text>
          <Text style={styles.resultText}>Confianza: {resultado.confidence}%</Text>
          {resultado.detection_fallback_applied && (
            <Text style={styles.fallbackText}>⚠️ Nota: Se aplicó encuadre de seguridad central.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
  image: { width: 250, height: 250, borderRadius: 15, marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 10, width: '100%', elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  resultText: { fontSize: 16, color: '#34495e', marginVertical: 2 },
  fallbackText: { fontSize: 12, color: '#e67e22', marginTop: 8, fontStyle: 'italic' }
});
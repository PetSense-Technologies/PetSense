import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function ScannerScreen() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Conexión del celular con el backend
    const BACKEND_URL = `${API_BASE_URL}/predict`;

    // Función para reiniciar el escáner
    const resetScanner = () => {
        setImage(null);
        setLastAnalysis(null);
        setErrorMessage(null);
    };

    // Aquí se procesa y envía la imagen al Backend FastAPI
    const uploadImage = async (uri) => {
        setLoading(true);
        setErrorMessage(null);
        setLastAnalysis(null);

        try {
            // 1. Se lee el ID guardado en el registro inicial
            const idGuardado = await AsyncStorage.getItem('mascota_id_real');
            const idMascota = idGuardado ? idGuardado : '1';

            console.log(`Enviando imagen para la mascota ID: ${idMascota}`);

            // 2. Metemos tanto el archivo como el ID dentro de FormData
            let formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            });
            formData.append('mascota_id', idMascota);

            // 3. Hacemos la petición al backend
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            // Manejar diferentes estados de respuesta
            if (data.status === 'success') {
                const ahora = new Date();
                const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                setLastAnalysis({
                    hora: `Hoy ${horaFormateada}`,
                    emocion: data.emotion,
                    confianza: data.confidence,
                    esPerro: true,
                    mensajeGemini: data.verificacion_gemini?.mensaje || 'Verificación exitosa'
                });

                // Mostrar notificación de éxito
                Alert.alert(
                    "✅ Análisis completado",
                    `Tu mascota está ${data.emotion} con un ${data.confidence}% de confianza`,
                    [{ text: "OK" }]
                );
            } 
            else if (data.status === 'error' && data.message === 'No es su mascota') {
                // Caso específico: No es un perro
                setErrorMessage({
                    tipo: 'no_perro',
                    mensaje: 'No es su mascota',
                    detalle: data.detalle_gemini || 'La imagen no contiene un perro. Por favor, sube una foto de tu mascota canina.'
                });

                Alert.alert(
                    "🐕 No es su mascota",
                    `La imagen analizada no contiene un perro.\n\n${data.detalle_gemini || 'Por favor, intenta con otra foto de tu mascota'}`,
                    [{ text: "Entendido" }]
                );
            }
            else {
                // Otros errores
                setErrorMessage({
                    tipo: 'error_general',
                    mensaje: 'Error en el análisis',
                    detalle: data.message || 'Ocurrió un error al analizar la imagen'
                });

                Alert.alert(
                    "❌ Error en el análisis",
                    data.message || "No se pudo procesar la imagen correctamente",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error('Error en uploadImage:', error);
            setErrorMessage({
                tipo: 'conexion',
                mensaje: 'Error de conexión',
                detalle: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
            });
            
            Alert.alert(
                "⚠️ Error de conexión",
                "No se pudo conectar con el servidor de IA. Verifica tu conexión a internet.",
                [{ text: "OK" }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Opción 1: Abrir la Cámara Nativa
    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert(
                "Permiso requerido",
                "Se necesitan permisos para acceder a la cámara",
                [{ text: "OK" }]
            );
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri);
        }
    };

    // Opción 2: Abrir la Galería de Fotos
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert(
                "Permiso requerido",
                "Se necesitan permisos para acceder a la galería",
                [{ text: "OK" }]
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.brand}>🐾 PetSense</Text>
                <Text style={styles.tagline}>Analizador de Emociones de tu mascota</Text>
            </View>

            {/* Contenedor de Previsualización Detección */}
            <View style={styles.dashedContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.fullImage} />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="camera-outline" size={50} color="#7F8E9C" />
                        <Text style={styles.emptyText}>Toma una foto o sube una imagen de tu mascota</Text>
                    </View>
                )}
                
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={styles.loadingText}>Analizando con IA...</Text>
                    </View>
                )}
                
                {/* Mostrar mensaje de error en la imagen si existe */}
                {errorMessage && !loading && (
                    <View style={[
                        styles.errorOverlay,
                        errorMessage.tipo === 'no_perro' && styles.errorOverlayNoPerro
                    ]}>
                        <Ionicons 
                            name={errorMessage.tipo === 'no_perro' ? "paw-outline" : "warning-outline"} 
                            size={50} 
                            color={errorMessage.tipo === 'no_perro' ? "#F59E0B" : "#EF4444"} 
                        />
                        <Text style={styles.errorOverlayTitle}>{errorMessage.mensaje}</Text>
                        <Text style={styles.errorOverlayText}>{errorMessage.detalle}</Text>
                        <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
                            <Text style={styles.resetButtonText}>Intentar de nuevo</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Botón: Tomar Foto Nativa */}
            <TouchableOpacity 
                style={[styles.btnPrimary, loading && styles.btnDisabled]} 
                onPress={takePhoto} 
                disabled={loading}
            >
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Tomar foto</Text>
            </TouchableOpacity>

            {/* Botón: Subir Imagen de Galería */}
            <TouchableOpacity 
                style={[styles.btnSecondary, loading && styles.btnDisabled]} 
                onPress={pickImage} 
                disabled={loading}
            >
                <Ionicons name="cloud-upload-outline" size={20} color="#3A536B" />
                <Text style={styles.btnSecondaryText}>Subir imagen</Text>
            </TouchableOpacity>

            {/* Botón de reinicio cuando hay error */}
            {errorMessage && !loading && (
                <TouchableOpacity style={styles.btnReset} onPress={resetScanner}>
                    <Ionicons name="refresh-outline" size={20} color="#FFF" />
                    <Text style={styles.btnResetText}>Tomar nueva foto</Text>
                </TouchableOpacity>
            )}

            {/* Tarjeta de Resultados (Se dibuja si existe un análisis previo y no hay error) */}
            {lastAnalysis && !errorMessage && (
                <View style={styles.resultCard}>
                    <View style={[
                        styles.iconBadge,
                        lastAnalysis.emocion === 'FELIZ' || lastAnalysis.emocion === 'EMOCIONADO' 
                            ? styles.iconBadgeFeliz 
                            : styles.iconBadgeNeutral
                    ]}>
                        <Ionicons 
                            name={
                                lastAnalysis.emocion === 'FELIZ' ? "happy-outline" :
                                lastAnalysis.emocion === 'EMOCIONADO' ? "heart-outline" :
                                lastAnalysis.emocion === 'TRANQUILO' ? "bed-outline" :
                                lastAnalysis.emocion === 'TRISTE' ? "sad-outline" :
                                "help-circle-outline"
                            } 
                            size={26} 
                            color={
                                lastAnalysis.emocion === 'FELIZ' || lastAnalysis.emocion === 'EMOCIONADO' 
                                    ? "#22C55E" 
                                    : "#6B7280"
                            } 
                        />
                    </View>
                    <View style={styles.resultTextContainer}>
                        <Text style={styles.resultLabel}>Último análisis · {lastAnalysis.hora}</Text>
                        <Text style={styles.resultData}>
                            Tu mascota está <Text style={[
                                styles.resultEmphasis,
                                lastAnalysis.emocion === 'FELIZ' || lastAnalysis.emocion === 'EMOCIONADO' 
                                    ? styles.textGreen 
                                    : styles.textGray
                            ]}>
                                {lastAnalysis.emocion} · {lastAnalysis.confianza}%
                            </Text>
                        </Text>
                        {lastAnalysis.mensajeGemini && (
                            <Text style={styles.resultSubtext}>
                                <Ionicons name="checkmark-circle" size={14} color="#22C55E" /> 
                                {' '}{lastAnalysis.mensajeGemini}
                            </Text>
                        )}
                    </View>
                    <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color="#22C55E" 
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F4F7F9', 
        paddingHorizontal: 24, 
        paddingTop: 50 
    },
    header: { 
        marginBottom: 20 
    },
    brand: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#102A43' 
    },
    tagline: { 
        fontSize: 15, 
        color: '#486581', 
        marginTop: 4 
    },
    dashedContainer: {
        width: '100%',
        height: 280,
        borderWidth: 2,
        borderColor: '#BCCCDC',
        borderStyle: 'dashed',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative'
    },
    fullImage: { 
        width: '100%', 
        height: '100%', 
        resizeMode: 'cover' 
    },
    emptyState: { 
        alignItems: 'center', 
        paddingHorizontal: 40 
    },
    emptyText: { 
        textAlign: 'center', 
        color: '#627D98', 
        fontSize: 15, 
        marginTop: 12, 
        lineHeight: 22 
    },
    loadingOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(240,244,248,0.85)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: { 
        marginTop: 10, 
        color: '#102A43', 
        fontWeight: '600' 
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(254, 242, 242, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorOverlayNoPerro: {
        backgroundColor: 'rgba(255, 251, 235, 0.95)',
    },
    errorOverlayTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#DC2626',
        marginTop: 12,
        textAlign: 'center'
    },
    errorOverlayText: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22
    },
    resetButton: {
        marginTop: 20,
        backgroundColor: '#DC2626',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 2
    },
    resetButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    btnPrimary: {
        flexDirection: 'row',
        backgroundColor: '#244B5A',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
        elevation: 2
    },
    btnPrimaryText: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    btnSecondary: {
        flexDirection: 'row',
        backgroundColor: '#E4ECF5',
        borderWidth: 1,
        borderColor: '#D0E1F3',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20
    },
    btnSecondaryText: { 
        color: '#244B5A', 
        fontSize: 16, 
        fontWeight: '600' 
    },
    btnDisabled: {
        opacity: 0.6
    },
    btnReset: {
        flexDirection: 'row',
        backgroundColor: '#EF4444',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
        elevation: 2
    },
    btnResetText: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E9F0',
        elevation: 1
    },
    iconBadge: { 
        width: 44, 
        height: 44, 
        backgroundColor: '#DCFCE7', 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    iconBadgeFeliz: {
        backgroundColor: '#DCFCE7'
    },
    iconBadgeNeutral: {
        backgroundColor: '#F3F4F6'
    },
    resultTextContainer: { 
        flex: 1, 
        marginLeft: 14 
    },
    resultLabel: { 
        fontSize: 12, 
        color: '#627D98', 
        marginBottom: 2 
    },
    resultData: { 
        fontSize: 15, 
        color: '#102A43' 
    },
    resultEmphasis: {
        fontWeight: 'bold'
    },
    textGreen: {
        color: '#22C55E'
    },
    textGray: {
        color: '#6B7280'
    },
    resultSubtext: { 
        fontSize: 12, 
        color: '#22C55E', 
        marginTop: 4 
    }
});
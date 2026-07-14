import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const STEPS = [
    { id: 'vista_frontal', title: 'Vista Frontal', desc: 'Toma una foto de frente a tu mascota', img: require('../../assets/perro_frontal.jpg') },
    { id: 'lado_izq', title: 'Lado Izquierdo', desc: 'Toma una foto del perfil izquierdo', img: require('../../assets/perro_izq.jpg') },
    { id: 'lado_der', title: 'Lado Derecho', desc: 'Toma una foto del perfil derecho', img: require('../../assets/perro_derecho.jpg') },
    { id: 'vista_3_4', title: 'Vista 3/4', desc: 'Toma una foto en un ángulo de 3/4', img: require('../../assets/3_4.jpg') },
    { id: 'vista_superior', title: 'Vista Superior', desc: 'Toma una foto desde arriba de tu mascota', img: require('../../assets/perro_superior.jpg') }
];

export default function CrearPerfilScreen({ navigation }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const step = STEPS[currentStepIndex];
    const isLastStep = currentStepIndex === STEPS.length - 1;

    const uploadImage = async (uri) => {
        setLoading(true);
        try {
            const idGuardado = await AsyncStorage.getItem('mascota_id_real');
            if (!idGuardado) {
                Alert.alert("Error", "No se encontró el ID de la mascota. Regístrala de nuevo.");
                return;
            }

            let formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: `${step.id}.jpg`,
                type: 'image/jpeg',
            });
            formData.append('mascota_id', idGuardado);
            formData.append('tipo_foto', step.id);

            const response = await fetch(`${API_BASE_URL}/subir-foto-perfil`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("¡Excelente!", "Foto subida correctamente.");
                setImage(null);
                if (isLastStep) {
                    Alert.alert("¡Perfil completado!", "El perfil biométrico ha sido creado con éxito.");
                    navigation.navigate('MenuPrincipal');
                } else {
                    setCurrentStepIndex(prev => prev + 1);
                }
            } else {
                Alert.alert("Error", data.detail || "No se pudo subir la foto.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permisos", "¡Se requieren permisos para acceder a la cámara!");
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

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permisos", "¡Se requieren permisos para acceder a la galería!");
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
            <View style={styles.header}>
                <Text style={styles.brand}><Ionicons name="paw" size={20} color="#FF6D3F" /> PetSense</Text>
                <Text style={styles.tagline}>Crea el perfil biométrico de tu perro</Text>
            </View>

            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Paso {currentStepIndex + 1} de {STEPS.length}</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }]} />
                </View>
            </View>

            <Text style={styles.instructionTitle}>{step.title}</Text>
            <Text style={styles.instructionDesc}>{step.desc}</Text>

            <View style={styles.dashedContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.fullImage} />
                ) : (
                    <Image source={step.img} style={styles.referenceImage} />
                )}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={styles.loadingText}>Subiendo foto...</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={takePhoto} disabled={loading}>
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={pickImage} disabled={loading}>
                <Ionicons name="cloud-upload-outline" size={20} color="#3A536B" />
                <Text style={styles.btnSecondaryText}>Subir imagen</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    header: { marginBottom: 20 },
    brand: { fontSize: 26, fontWeight: 'bold', color: '#102A43' },
    tagline: { fontSize: 15, color: '#486581', marginTop: 4 },
    stepIndicator: { marginBottom: 20 },
    stepText: { fontSize: 14, fontWeight: 'bold', color: '#102A43', marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: '#E4ECF5', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#244B5A' },
    instructionTitle: { fontSize: 20, fontWeight: 'bold', color: '#102A43', marginBottom: 6 },
    instructionDesc: { fontSize: 14, color: '#486581', marginBottom: 20 },
    dashedContainer: {
        width: '100%', height: 280, borderWidth: 2, borderColor: '#BCCCDC', borderStyle: 'dashed',
        borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8',
        overflow: 'hidden', marginBottom: 20, position: 'relative'
    },
    referenceImage: { width: '80%', height: '80%', resizeMode: 'contain', opacity: 0.8 },
    fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(240,244,248,0.85)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#102A43', fontWeight: '600' },
    btnPrimary: { flexDirection: 'row', backgroundColor: '#244B5A', width: '100%', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12, elevation: 2 },
    btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    btnSecondary: { flexDirection: 'row', backgroundColor: '#E4ECF5', borderWidth: 1, borderColor: '#D0E1F3', width: '100%', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 },
    btnSecondaryText: { color: '#244B5A', fontSize: 16, fontWeight: '600' }
});

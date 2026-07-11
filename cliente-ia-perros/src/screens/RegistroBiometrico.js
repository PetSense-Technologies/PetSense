import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.18.3:8000';

export default function RegistroBiometrico({ navigation, route }) {
    const { mascotaId } = route.params;
    const [fotosCapturadas, setFotosCapturadas] = useState(0);
    const [loading, setLoading] = useState(false);

    const registrarRostro = async (uri) => {
        setLoading(true);
        let formData = new FormData();
        formData.append('file', { uri, name: `perfil_${fotosCapturadas}.jpg`, type: 'image/jpeg' });
        formData.append('posicion', fotosCapturadas);

        try {
            const response = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/registro-facial`, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data = await response.json();
            if (data.status === 'success') {
                const nuevas = fotosCapturadas + 1;
                setFotosCapturadas(nuevas);
                if (nuevas === 3) {
                    Alert.alert("¡Éxito!", "Perfil biométrico creado.");
                    navigation.navigate('MenuPrincipal');
                }
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (e) {
            Alert.alert("Error", "No se pudo conectar al servidor.");
        } finally {
            setLoading(false);
        }
    };

    const abrirCamara = async () => {
        let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8, aspect: [1, 1] });
        if (!result.canceled) await registrarRostro(result.assets[0].uri);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Encabezado con el círculo y huella */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="paw" size={18} color="#FFF" />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Registro Biométrico</Text>
                    <Text style={styles.headerSubtitle}>Captura las facciones de tu perrito</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.counterBox}>
                        <Text style={styles.counterText}>{fotosCapturadas} / 3</Text>
                    </View>
                    <Text style={styles.instruction}>
                        {fotosCapturadas === 0 ? "Toma una foto frontal" :
                            fotosCapturadas === 1 ? "Toma una foto lateral izquierda" :
                                "Toma una foto lateral derecha"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.mainButton}
                    onPress={abrirCamara}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Text style={styles.mainButtonText}>Capturar Foto</Text>
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9' },
    header: { backgroundColor: '#132F35', padding: 25, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    iconCircle: { width: 38, height: 38, borderRadius: 25, backgroundColor: '#244B5A', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    headerSubtitle: { color: '#BACCD6', fontSize: 14 },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    counterBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F4F7F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#244B5A' },
    counterText: { fontSize: 32, fontWeight: 'bold', color: '#244B5A' },
    instruction: { fontSize: 16, color: '#132F35', fontWeight: '600', marginTop: 10 },
    mainButton: { backgroundColor: '#244B5A', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, borderRadius: 15, marginTop: 30, gap: 10 },
    mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [image, setImage] = useState(null);

    useEffect(() => {
        (async () => {
            if (!permission || !permission.granted) {
                await requestPermission();
            }
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    if (!permission) {
        return <View style={styles.center}><Text>Cargando configuración de permisos...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ textAlign: 'center', marginBottom: 15 }}>Necesitamos tu permiso para usar la cámara</Text>
                <TouchableOpacity style={styles.btnMain} onPress={requestPermission}>
                    <Text style={styles.btnText}>Conceder Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Escáner Canino</Text>
            <View style={styles.previewBox}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <Text style={styles.previewText}>No hay foto seleccionada</Text>
                )}
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btn} onPress={pickImage}>
                    <Icon name="images" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnMain]}>
                    <Icon name="camera" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Cámara</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20, alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginTop: 40, marginBottom: 20 },
    previewBox: { width: '100%', height: 350, backgroundColor: '#E4E8EE', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 30 },
    previewText: { color: '#666', fontSize: 16 },
    image: { width: '100%', height: '100%' },
    actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
    btn: { flexDirection: 'row', backgroundColor: '#6C757D', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', gap: 8 },
    btnMain: { backgroundColor: '#4F46E5', flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', gap: 8 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
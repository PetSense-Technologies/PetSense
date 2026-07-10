import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function HistoryScreen() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    const fetchHistorial = async () => {
        try {
            const mascotaIdReal = await AsyncStorage.getItem('mascota_id_real');

            if (!mascotaIdReal) {
                setHistorial([]);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            console.log(`[FRONTEND] Pidiendo historial en tiempo real para mascota ID: ${mascotaIdReal}`);

            const res = await fetch(`${API_BASE_URL}/mascotas/${mascotaIdReal}/historial`);
            const data = await res.json();

            if (data && Array.isArray(data.historial)) {
                setHistorial(data.historial);
                setError(false);
            } else if (data && Array.isArray(data)) {
                setHistorial(data);
                setError(false);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Error al conectar con la API:", err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistorial();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistorial();
    };

    const getEmotionDetails = (emocion) => {
        if (!emocion) return { color: '#94A3B8', icon: 'help-circle-outline', label: 'Sin Datos' };

        // Normalizamos: mayúsculas, quitamos espacios y comillas
        const emo = emocion.toString().replace(/['"]+/g, '').toUpperCase().trim();

        // Si la palabra contiene ALERT, devolvemos el icono de advertencia directamente
        if (emo.includes('ALERT')) {
            return { color: '#F59E0B', icon: 'warning-outline', label: 'Alerta' };
        }

        switch (emo) {
            case 'FELIZ':
            case 'HAPPY':
                return { color: '#10B981', icon: 'happy-outline', label: 'Feliz' };

            case 'EMOCIONADO':
            case 'EXCITED':
                return { color: '#F59E0B', icon: 'flame-outline', label: 'Emocionado' };

            case 'TRANQUILO':
            case 'RELAXED':
            case 'RELAX':
            case 'RELAXING':
            case 'CALM':
                return { color: '#3B82F6', icon: 'leaf-outline', label: 'Tranquilo' };

            case 'TRISTE':
            case 'SAD':
            case 'FROWN':
                return { color: '#64748B', icon: 'sad-outline', label: 'Triste' };

            case 'ANSIOSO':
            case 'ANGRY':
                return { color: '#EF4444', icon: 'alert-circle-outline', label: 'Enojado/Bravo' };

            default: return { color: '#64748B', icon: 'help-circle-outline', label: emo };
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
            <Text style={styles.title}>Historial de Análisis</Text>

            {error && (
                <View style={styles.errorCard}>
                    <Ionicons name="cloud-offline-outline" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>No se pudo sincronizar el historial.</Text>
                </View>
            )}

            {historial.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Ionicons name="images-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyText}>Aún no has realizado escaneos con esta mascota.</Text>
                </View>
            ) : (
                historial.map((item, index) => {
                    // Evaluamos la clave del JSON mapeado
                    const emoDetails = getEmotionDetails(item.emocion);
                    return (
                        <View key={item.id || index} style={[styles.historyCard, { borderLeftColor: emoDetails.color }]}>
                            <View style={styles.cardRow}>
                                <View style={styles.emotionInfo}>
                                    <Ionicons name={emoDetails.icon} size={24} color={emoDetails.color} style={{ marginRight: 8 }} />
                                    <View>
                                        <Text style={styles.emotionName}>{emoDetails.label}</Text>
                                        <Text style={styles.dateText}>{item.fecha || 'Sin fecha'}</Text>
                                    </View>
                                </View>
                                <View style={[styles.confidenceBadge, { backgroundColor: emoDetails.color + '15' }]}>
                                    <Text style={[styles.confidenceText, { color: emoDetails.color }]}>{parseFloat(item.confianza || 0).toFixed(2)}%</Text>
                                </View>
                            </View>
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#F1F5F9', flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
    loadingText: { marginTop: 10, color: '#64748B', fontSize: 14 },
    historyCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 5, elevation: 2 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emotionInfo: { flexDirection: 'row', alignItems: 'center' },
    emotionName: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    dateText: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    confidenceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    confidenceText: { fontSize: 14, fontWeight: 'bold' },
    emptyCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    emptyText: { color: '#64748B', marginTop: 10, textAlign: 'center', fontSize: 14 },
    errorCard: { flexDirection: 'row', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
    errorText: { color: '#991B1B', marginLeft: 10, fontSize: 14, fontWeight: '500' }
});
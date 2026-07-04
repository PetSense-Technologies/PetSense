import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, MASCOTA_ID } from '../config';

export default function HistoryScreen() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    // Obteneción datos desde FastAPI
    const fetchHistorial = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/mascotas/${MASCOTA_ID}/historial`);
            const data = await response.json();

            if (data.status === 'success') {
                setHistorial(data.historial);
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

    // Cargar datos la primera vez que se monta la pantalla
    useEffect(() => {
        fetchHistorial();
    }, []);

    // Función para el Pull to Refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchHistorial();
    };

    // Se cargan estilos visuales según la emoción real
    const getEmotionDetails = (emotion) => {
        const emotionLower = emotion.toLowerCase();
        switch (emotionLower) {
            case 'feliz':
                return { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' };
            case 'emocionado':
                return { icon: 'flash-outline', color: '#F97316', bgColor: '#FFEDD5' };
            case 'tranquilo':
                return { icon: 'contrast-outline', color: '#244B5A', bgColor: '#E4ECF5' };
            case 'triste':
                return { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' };
            case 'ansioso':
                return { icon: 'alert-circle-outline', color: '#D97706', bgColor: '#FEF3C7' };
            default:
                return { icon: 'paw-outline', color: '#627D98', bgColor: '#F0F4F8' };
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#244B5A" />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color="#D97706" />
                <Text style={styles.errorText}>No se pudo conectar con el servidor</Text>
                <Text style={styles.errorSubtext}>Verifica que la API esté corriendo y la IP en config.js sea correcta.</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#244B5A']} />
            }
        >
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.title}>Historial</Text>
                <Text style={styles.subtitle}>Registros de emociones detectadas</Text>
            </View>

            {/* Lista de Tarjetas Reales u opción vacía */}
            {historial.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="images-outline" size={48} color="#BACCD6" />
                    <Text style={styles.emptyText}>No hay escaneos registrados aún</Text>
                    <Text style={styles.emptySubtext}>¡Ve a la pestaña Escanear para realizar el primer análisis!</Text>
                </View>
            ) : (
                historial.map((registro) => {
                    const details = getEmotionDetails(registro.emocion);
                    return (
                        <View key={registro.id} style={styles.historyCard}>
                            <View style={[styles.iconContainer, { backgroundColor: details.bgColor }]}>
                                <Ionicons name={details.icon} size={24} color={details.color} />
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.emotionTitle}>{registro.emocion}</Text>
                                    <Text style={styles.confidenceText}>{registro.confianza}% conf.</Text>
                                </View>
                                <Text style={styles.dateText}>{registro.fecha}</Text>
                            </View>
                        </View>
                    );
                })
            )}

            {/* Margen de seguridad inferior */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#102A43' },
    subtitle: { fontSize: 15, color: '#486581', marginTop: 4 },

    // Contenedores de estado (Carga / Error / Vacío)
    centerContainer: { flex: 1, backgroundColor: '#F4F7F9', justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#486581', fontWeight: '500' },
    errorText: { marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#102A43', textAlign: 'center' },
    errorSubtext: { marginTop: 8, fontSize: 14, color: '#627D98', textAlign: 'center', lineHeight: 20 },
    emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#486581' },
    emptySubtext: { marginTop: 6, fontSize: 14, color: '#9FB3C8', textAlign: 'center' },

    // Tarjetas del Historial
    historyCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E4E9F0',
        elevation: 1,
    },
    iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, marginLeft: 16 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emotionTitle: { fontSize: 16, fontWeight: '700', color: '#102A43' },
    confidenceText: { fontSize: 13, fontWeight: '600', color: '#627D98' },
    dateText: { fontSize: 13, color: '#9FB3C8', marginTop: 4, fontWeight: '500' }
});
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function AnalysisScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ bienestar: 0, weeklyScans: [], distribution: [], insight: "" });

    const evaluarInsights = (dist) => {
        const emocionesOrdenadas = Object.keys(dist).sort((a, b) => dist[b] - dist[a]);
        const topEmocion = emocionesOrdenadas[0];
        const frecuencia = dist[topEmocion] || 0;

        if (frecuencia < 5) return "Seguimos analizando... ¡Tu mascota pronto nos contará cómo se siente!";

        const triggers = {
            'FELIZ': "🎉 ¡Tu mascota está radiante! Es el mejor momento para premiarla con su juguete favorito.",
            'HAPPY': "🎉 ¡Tu mascota está radiante! Es el mejor momento para premiarla con su juguete favorito.",
            'TRISTE': "🥺 Notamos tristeza recurrente. Un paseo extra o más mimos pueden cambiarle el día.",
            'FROWN': "🥺 Notamos tristeza recurrente. Un paseo extra o más mimos pueden cambiarle el día.",
            'ANGRY': "💢 Se siente irritable. Verifica si algún juguete o sonido externo la está molestando.",
            'ALERT': "👀 Está muy alerta. Revisa que su entorno sea seguro y libre de ruidos fuertes.",
            'RELAX': "🧘 Tu mascota está en paz. ¡Es el ambiente perfecto para su salud!",
            'ANSIOSO': "😰 Detectamos ansiedad. Intenta poner música relajante para mascotas en casa.",
        };
        return triggers[topEmocion] || "Tu perrito ha estado muy expresivo últimamente. ¡Sigue monitoreándolo!";
    };

    const fetchAnalysis = async () => {
        setRefreshing(true);
        try {
            const mascotaId = await AsyncStorage.getItem('mascota_id_real');
            if (!mascotaId) { setLoading(false); return; }

            const res = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/historial`);
            const data = await res.json();
            const historial = Array.isArray(data.historial) ? data.historial : [];

            const dist = {};
            historial.forEach(h => { const e = h.emocion?.toUpperCase().trim(); if (e) dist[e] = (dist[e] || 0) + 1; });

            const scanCounts = [0, 0, 0, 0, 0, 0, 0];
            historial.forEach(h => { const date = new Date(h.fecha); if (!isNaN(date.getTime())) scanCounts[date.getDay()] += 1; });
            const weeklyScans = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'].map((day, i) => ({
                day, count: scanCounts[i], height: Math.min(Math.max(scanCounts[i] * 15, 15), 70)
            }));

            const config = {
                'FELIZ': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
                'HAPPY': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
                'ALERT': { icon: 'warning-outline', color: '#F59E0B', bgColor: '#FFEDD5' },
                'ANGRY': { icon: 'alert-circle-outline', color: '#EF4444', bgColor: '#FEE2E2' },
                'ANSIOSO': { icon: 'alert-circle-outline', color: '#EF4444', bgColor: '#FEE2E2' },
                'FROWN': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' },
                'RELAX': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'TRANQUILO': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'RELAXED': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'RELAXING': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'CALM': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'TRISTE': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' },
                'SAD': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' },
                'FROWN': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' }

            };

            setStats({
                bienestar: 85,
                weeklyScans,
                distribution: Object.keys(dist).map((key, i) => ({
                    id: i, name: key, count: `${dist[key]}x`, percentage: `${Math.round((dist[key] / (historial.length || 1)) * 100)}%`,
                    ...config[key] || { icon: 'help-circle-outline', color: '#64748B', bgColor: '#E2E8F0' }
                })),
                insight: evaluarInsights(dist)
            });
        } catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { fetchAnalysis(); }, []));

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#244B5A" /></View>;

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAnalysis} />}>
            <Text style={styles.title}>Análisis</Text>

            <View style={styles.welfareCard}>
                <Text style={styles.welfareLabel}>BIENESTAR GENERAL</Text>
                <Text style={styles.welfareScore}>{stats.bienestar}<Text style={styles.welfareTotal}>/100</Text></Text>
                <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${stats.bienestar}%` }]} /></View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Frecuencia de Escaneos</Text>
                <View style={styles.chartRow}>
                    {stats.weeklyScans.map((item, i) => (
                        <TouchableOpacity key={i} style={styles.chartColumn} onPress={() => Alert.alert("Detalle", `${item.count} escaneos el día ${item.day}`)}>
                            <View style={[styles.barFill, { height: item.height }]} />
                            <Text style={styles.chartDay}>{item.day}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución de Emociones</Text>
                {stats.distribution.map(e => (
                    <View key={e.id} style={styles.emotionRow}>
                        <View style={[styles.iconBadge, { backgroundColor: e.bgColor }]}><Ionicons name={e.icon} size={20} color={e.color} /></View>
                        <View style={styles.emotionProgressContainer}>
                            <View style={styles.emotionInfoTextRow}>
                                <Text style={styles.emotionName}>{e.name}</Text>
                                <Text style={{ color: e.color, fontWeight: 'bold' }}>{e.count}</Text>
                            </View>
                            <View style={styles.emotionBarBackground}><View style={[styles.emotionBarFill, { width: e.percentage, backgroundColor: e.color }]} /></View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.insightCard}>
                <Ionicons name="sparkles" size={24} color="#FFD700" />
                <Text style={styles.insightText}>{stats.insight}</Text>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#102A43', marginBottom: 20 },
    welfareCard: { backgroundColor: '#244B5A', borderRadius: 24, padding: 25, marginBottom: 20 },
    welfareLabel: { color: '#BACCD6', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    welfareScore: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginTop: 5 },
    welfareTotal: { fontSize: 20, color: '#BACCD6' },
    progressBarBackground: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, marginTop: 15 },
    progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#E4E9F0', overflow: 'hidden' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#102A43', marginBottom: 20 },
    chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
    chartColumn: { alignItems: 'center' },
    barFill: { width: 22, backgroundColor: '#FF6D3F', borderRadius: 6 },
    chartDay: { marginTop: 8, fontSize: 12, color: '#627D98', fontWeight: '600' },
    emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emotionProgressContainer: { flex: 1, marginLeft: 14, overflow: 'hidden' },
    emotionInfoTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    emotionName: { fontSize: 14, fontWeight: '700', color: '#102A43' },
    emotionBarBackground: { height: 6, backgroundColor: '#F0F4F8', borderRadius: 3 },
    emotionBarFill: { height: '100%', borderRadius: 3 },
    insightCard: { backgroundColor: '#244B5A', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
    insightText: { color: '#FFF', fontSize: 14, flex: 1, lineHeight: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F9' }
});
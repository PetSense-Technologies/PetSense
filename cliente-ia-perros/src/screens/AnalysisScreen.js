import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function AnalysisScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ bienestar: 0, weeklyScans: [], distribution: [], insight: "" });

    const fetchAnalysis = async () => {
        try {
            const mascotaId = await AsyncStorage.getItem('mascota_id_real');
            if (!mascotaId) {
                setLoading(false);
                return;
            }

            // 1. Intentar descargar del servidor
            const res = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/historial`, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            const data = await res.json();
            const historial = Array.isArray(data.historial) ? data.historial : (Array.isArray(data) ? data : []);

            // --- SINCRONIZACIÓN CON EL PERFIL ---
            // Guardamos el historial completo en local para que el Perfil pueda contarlo
            await AsyncStorage.setItem('historial_escaneos', JSON.stringify(historial));

            // Si hay historial, guardamos la última emoción para el badge del perfil
            if (historial.length > 0) {
                const ultimaEmocion = historial[historial.length - 1].emocion;
                await AsyncStorage.setItem('ultimo_estado_detectado', ultimaEmocion);
            }
            // ------------------------------------

            // Lógica de cálculo de bienestar
            const scores = { 'FELIZ': 100, 'HAPPY': 100, 'TRANQUILO': 90, 'RELAXED': 90, 'EMOCIONADO': 80, 'EXCITED': 80, 'TRISTE': 50, 'SAD': 50, 'ANSIOSO': 30, 'ANGRY': 30, 'ALERT': 40, 'FROWN': 50, 'RELAX': 90 };
            let totalScore = 0;
            historial.forEach(h => totalScore += scores[h.emocion?.toUpperCase()] || 70);
            const avgBienestar = Math.round(totalScore / (historial.length || 1));

            // Lógica de escaneos por día
            const daysMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'Mi', 4: 'J', 5: 'V', 6: 'S' };
            const scanCounts = [0, 0, 0, 0, 0, 0, 0];
            historial.forEach(h => {
                const date = new Date(h.fecha);
                if (!isNaN(date.getTime())) scanCounts[date.getDay()] += 1;
            });
            const weeklyScans = Object.keys(daysMap).map(k => ({ day: daysMap[k], count: scanCounts[k] * 15 })); // Multiplicador para visibilidad de barras

            // Lógica de Distribución
            const dist = {};
            historial.forEach(h => { const e = h.emocion?.toUpperCase().trim(); if (e) dist[e] = (dist[e] || 0) + 1; });

            const config = {
                'FELIZ': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
                'HAPPY': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
                'ALERT': { icon: 'warning-outline', color: '#F59E0B', bgColor: '#FFEDD5' },
                'ANGRY': { icon: 'alert-circle-outline', color: '#EF4444', bgColor: '#FEE2E2' },
                'FROWN': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' },
                'RELAX': { icon: 'leaf-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
                'TRISTE': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' }
            };

            const distribution = Object.keys(dist).map((key, i) => ({
                id: i, name: key, count: `${dist[key]}x`, percentage: `${Math.round((dist[key] / historial.length) * 100)}%`,
                ...config[key] || { icon: 'help-circle-outline', color: '#64748B', bgColor: '#E2E8F0' }
            }));

            // Insight
            const topEmo = Object.keys(dist).length > 0 ? Object.keys(dist).reduce((a, b) => dist[a] > dist[b] ? a : b) : "ANÁLISIS";
            const insight = topEmo === 'ALERT' ? "Tu mascota muestra signos de alerta. Revisa si hay ruidos fuertes cerca." : `Tu mascota ha estado principalmente ${topEmo.toLowerCase()} recientemente.`;

            setStats({ bienestar: avgBienestar, weeklyScans, distribution, insight });
        } catch (e) {
            console.error("Error en Análisis:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchAnalysis(); }, []));

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#244B5A" /></View>;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAnalysis} />}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Análisis</Text>

            {/* Tarjeta de Bienestar */}
            <View style={styles.welfareCard}>
                <Text style={styles.welfareLabel}>BIENESTAR GENERAL</Text>
                <Text style={styles.welfareScore}>{stats.bienestar}<Text style={styles.welfareTotal}>/100</Text></Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${stats.bienestar}%` }]} />
                </View>
            </View>

            {/* Gráfico de Barras */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Frecuencia de Escaneos</Text>
                <View style={styles.chartContainer}>
                    <View style={styles.chartRow}>
                        {stats.weeklyScans.map((item, i) => (
                            <View key={i} style={styles.chartColumn}>
                                <View style={styles.barContainer}>
                                    <View style={[styles.barFill, { height: `${Math.min(item.count, 100)}%` }]} />
                                </View>
                                <Text style={styles.chartDay}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Distribución de Emociones */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución de Emociones</Text>
                {stats.distribution.length > 0 ? stats.distribution.map(e => (
                    <View key={e.id} style={styles.emotionRow}>
                        <View style={[styles.iconBadge, { backgroundColor: e.bgColor }]}>
                            <Ionicons name={e.icon} size={20} color={e.color} />
                        </View>
                        <View style={styles.emotionProgressContainer}>
                            <View style={styles.emotionInfoTextRow}>
                                <Text style={styles.emotionName}>{e.name}</Text>
                                <Text style={{ color: e.color, fontWeight: 'bold' }}>{e.count}</Text>
                            </View>
                            <View style={styles.emotionBarBackground}>
                                <View style={[styles.emotionBarFill, { width: e.percentage, backgroundColor: e.color }]} />
                            </View>
                        </View>
                    </View>
                )) : (
                    <Text style={{ color: '#627D98', textAlign: 'center' }}>No hay suficientes datos aún.</Text>
                )}
            </View>

            {/* Insight */}
            <View style={styles.insightCard}>
                <Ionicons name="bulb-outline" size={20} color="#244B5A" style={{ marginBottom: 8 }} />
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
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#E4E9F0' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#102A43', marginBottom: 20 },
    chartContainer: { height: 100, justifyContent: 'center' },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
    chartColumn: { alignItems: 'center', width: '12%' },
    barContainer: { height: 60, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    barFill: { width: 8, backgroundColor: '#38BDF8', borderRadius: 4 },
    chartDay: { fontSize: 11, color: '#627D98', marginTop: 8, fontWeight: '600' },
    emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emotionProgressContainer: { flex: 1, marginLeft: 14 },
    emotionInfoTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    emotionName: { fontSize: 14, fontWeight: '700', color: '#102A43' },
    emotionBarBackground: { height: 6, backgroundColor: '#F0F4F8', borderRadius: 3 },
    emotionBarFill: { height: '100%', borderRadius: 3 },
    insightCard: { backgroundColor: '#DCEEFE', padding: 20, borderRadius: 24, marginBottom: 50, borderLeftWidth: 5, borderLeftColor: '#244B5A' },
    insightText: { color: '#244B5A', fontSize: 14, lineHeight: 22, fontWeight: '500' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F9' }
});
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function AnalysisScreen() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ bienestar: 0, weeklyScans: [], distribution: [], insight: "" });

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const mascotaId = await AsyncStorage.getItem('mascota_id_real');
            if (!mascotaId) return;

            const res = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/historial`);
            const data = await res.json();
            const historial = data.historial || data;

            // 1. Cálculo de Bienestar (Puntajes arbitrarios)
            const scores = { 'FELIZ': 100, 'HAPPY': 100, 'TRANQUILO': 90, 'RELAXED': 90, 'EMOCIONADO': 80, 'EXCITED': 80, 'TRISTE': 50, 'SAD': 50, 'ANSIOSO': 30, 'ANGRY': 30, 'ALERT': 40 };
            let totalScore = 0;
            historial.forEach(h => totalScore += scores[h.emocion?.toUpperCase()] || 70);
            const avgBienestar = Math.round(totalScore / historial.length);

            // 2. Escaneos por día (L, M, Mi, J, V, S, D)
            const daysMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'Mi', 4: 'J', 5: 'V', 6: 'S' };
            const scanCounts = [0, 0, 0, 0, 0, 0, 0];
            historial.forEach(h => {
                const date = new Date(h.fecha);
                scanCounts[date.getDay()] += 1;
            });
            const weeklyScans = Object.keys(daysMap).map(k => ({ day: daysMap[k], count: scanCounts[k] * 10 }));

            // 3. Distribución
            const dist = {};
            historial.forEach(h => {
                const e = h.emocion?.toUpperCase().trim();
                dist[e] = (dist[e] || 0) + 1;
            });
            const config = { 'FELIZ': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' }, 'HAPPY': { icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' }, 'ALERT': { icon: 'warning-outline', color: '#F59E0B', bgColor: '#FFEDD5' }, 'TRISTE': { icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' } };
            const distribution = Object.keys(dist).map((key, i) => ({
                id: i, name: key, count: `${dist[key]}x`, percentage: `${Math.round((dist[key] / historial.length) * 100)}%`,
                ...config[key] || { icon: 'help-circle-outline', color: '#64748B', bgColor: '#E2E8F0' }
            }));

            // 4. Insight
            const topEmo = Object.keys(dist).reduce((a, b) => dist[a] > dist[b] ? a : b);
            const insight = topEmo === 'ALERT' ? "Tu mascota muestra signos de alerta. Revisa si hay ruidos fuertes cerca." : `Tu mascota ha estado principalmente ${topEmo.toLowerCase()} esta semana.`;

            setStats({ bienestar: avgBienestar, weeklyScans, distribution, insight });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { fetchAnalysis(); }, []));

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Análisis</Text>

            <View style={styles.welfareCard}>
                <Text style={styles.welfareLabel}>BIENESTAR GENERAL</Text>
                <Text style={styles.welfareScore}>{stats.bienestar}<Text style={styles.welfareTotal}>/100</Text></Text>
                <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${stats.bienestar}%` }]} /></View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Escaneos por día</Text>
                <View style={styles.chartRow}>
                    {stats.weeklyScans.map((item, i) => (
                        <View key={i} style={styles.chartColumn}>
                            <View style={styles.barContainer}><View style={[styles.barFill, { height: `${item.count}%` }]} /></View>
                            <Text style={styles.chartDay}>{item.day}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución</Text>
                {stats.distribution.map(e => (
                    <View key={e.id} style={styles.emotionRow}>
                        <View style={[styles.iconBadge, { backgroundColor: e.bgColor }]}><Ionicons name={e.icon} size={20} color={e.color} /></View>
                        <View style={styles.emotionProgressContainer}>
                            <View style={styles.emotionInfoTextRow}><Text style={styles.emotionName}>{e.name}</Text><Text style={{ color: e.color }}>{e.count}</Text></View>
                            <View style={styles.emotionBarBackground}><View style={[styles.emotionBarFill, { width: e.percentage, backgroundColor: e.color }]} /></View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.insightCard}><Text style={styles.insightText}>{stats.insight}</Text></View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', padding: 24, paddingTop: 50 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#102A43', marginBottom: 20 },
    welfareCard: { backgroundColor: '#244B5A', borderRadius: 24, padding: 20, marginBottom: 20 },
    welfareLabel: { color: '#BACCD6', fontSize: 12, fontWeight: '700' },
    welfareScore: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
    welfareTotal: { fontSize: 20, color: '#BACCD6' },
    progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 10 },
    progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#102A43', marginBottom: 20 },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end' },
    chartColumn: { alignItems: 'center', width: '12%' },
    barContainer: { height: 80, width: '100%', justifyContent: 'flex-end' },
    barFill: { width: '100%', backgroundColor: '#38BDF8', borderRadius: 4 },
    chartDay: { fontSize: 12, color: '#627D98', marginTop: 8 },
    emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBadge: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emotionProgressContainer: { flex: 1, marginLeft: 14 },
    emotionInfoTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    emotionName: { fontSize: 14, fontWeight: '600' },
    emotionBarBackground: { height: 6, backgroundColor: '#F0F4F8', borderRadius: 3 },
    emotionBarFill: { height: '100%', borderRadius: 3 },
    insightCard: { backgroundColor: '#EBF1F5', padding: 20, borderRadius: 24, marginBottom: 50 },
    insightText: { color: '#486581', fontSize: 14, lineHeight: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
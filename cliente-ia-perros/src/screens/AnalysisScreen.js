import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnalysisScreen() {
    // Datos simulados
    const weeklyScans = [
        { day: 'L', count: 40, active: false },
        { day: 'M', count: 50, active: false },
        { day: 'Mi', count: 75, active: false },
        { day: 'J', count: 52, active: false },
        { day: 'V', count: 48, active: false },
        { day: 'S', count: 100, active: true },
        { day: 'D', count: 65, active: false },
    ];

    const emotionDistribution = [
        { id: 1, name: 'Feliz', count: '2x', percentage: '100%', icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
        { id: 2, name: 'Emocionado', count: '2x', percentage: '100%', icon: 'flash-outline', color: '#F97316', bgColor: '#FFEDD5' },
        { id: 3, name: 'Tranquilo', count: '2x', percentage: '100%', icon: 'contrast-outline', color: '#244B5A', bgColor: '#E4ECF5' },
        { id: 4, name: 'Triste', count: '1x', percentage: '50%', icon: 'sad-outline', color: '#6366F1', bgColor: '#E0E7FF' },
        { id: 5, name: 'Ansioso', count: '1x', percentage: '50%', icon: 'alert-circle-outline', color: '#D97706', bgColor: '#FEF3C7' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.title}>Análisis</Text>
                <Text style={styles.subtitle}>Tendencias emocionales de Max</Text>
            </View>

            {/* Tarjeta 1: Bienestar General */}
            <View style={styles.welfareCard}>
                <View style={styles.welfareTop}>
                    <View>
                        <Text style={styles.welfareLabel}>BIENESTAR GENERAL</Text>
                        <Text style={styles.welfareScore}>86<Text style={styles.welfareTotal}>/100</Text></Text>
                    </View>
                    <View style={styles.welfareIconContainer}>
                        <Ionicons name="trending-up" size={24} color="#FFF" />
                    </View>
                </View>
                {/* Barra de Progreso */}
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: '86%' }]} />
                </View>
                <Text style={styles.welfareTrend}>↑ 4 puntos esta semana</Text>
            </View>

            {/* Tarjeta 2: Escaneos por Día (Gráfico de Barras Custom) */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Escaneos por día</Text>
                <View style={styles.chartRow}>
                    {weeklyScans.map((item, index) => (
                        <View key={index} style={styles.chartColumn}>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            height: `${item.count}%`,
                                            backgroundColor: item.active ? '#F97316' : '#E4ECF5'
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.chartDay, item.active && styles.chartDayActive]}>
                                {item.day}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Tarjeta 3: Distribución de Emociones */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución de emociones</Text>
                {emotionDistribution.map((emotion) => (
                    <View key={emotion.id} style={styles.emotionRow}>
                        <View style={[styles.iconBadge, { backgroundColor: emotion.bgColor }]}>
                            <Ionicons name={emotion.icon} size={20} color={emotion.color} />
                        </View>
                        <View style={styles.emotionProgressContainer}>
                            <View style={styles.emotionInfoTextRow}>
                                <Text style={styles.emotionName}>{emotion.name}</Text>
                                <Text style={[styles.emotionCount, { color: emotion.color }]}>{emotion.count}</Text>
                            </View>
                            <View style={styles.emotionBarBackground}>
                                <View style={[styles.emotionBarFill, { width: emotion.percentage, backgroundColor: emotion.color }]} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Tarjeta 4: Insight de la semana (image_efd79c.png) */}
            <View style={styles.insightCard}>
                <View style={styles.insightIconContainer}>
                    <Ionicons name="brain-outline" size={22} color="#244B5A" />
                </View>
                <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Insight de la semana</Text>
                    <Text style={styles.insightText}>
                        Max está más feliz los sábados cuando hay más actividad física. Los estados de ansiedad ocurren principalmente durante eventos con ruido fuerte.
                    </Text>
                </View>
            </View>

            {/* Margen de seguridad inferior */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#102A43' },
    subtitle: { fontSize: 15, color: '#486581', marginTop: 4 },

    // Bienestar General
    welfareCard: { backgroundColor: '#244B5A', borderRadius: 24, padding: 20, marginBottom: 20 },
    welfareTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    welfareLabel: { color: '#BACCD6', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    welfareScore: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
    welfareTotal: { fontSize: 20, color: '#BACCD6', fontWeight: '500' },
    welfareIconContainer: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 12 },
    progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },
    welfareTrend: { color: '#BACCD6', fontSize: 13, fontWeight: '500' },

    // Estilo base de Tarjetas Blancas
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E4E9F0', marginBottom: 20, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#102A43', marginBottom: 20 },

    // Gráfico de Barras
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingTop: 10 },
    chartColumn: { alignItems: 'center', width: '11%' },
    barContainer: { height: 100, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    barFill: { width: '100%', borderRadius: 8 },
    chartDay: { fontSize: 13, color: '#627D98', marginTop: 10, fontWeight: '500' },
    chartDayActive: { color: '#F97316', fontWeight: '700' },

    // Distribución de Emociones
    emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBadge: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emotionProgressContainer: { flex: 1, marginLeft: 14 },
    emotionInfoTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    emotionName: { fontSize: 14, fontWeight: '600', color: '#102A43' },
    emotionCount: { fontSize: 13, fontWeight: '700' },
    emotionBarBackground: { height: 6, backgroundColor: '#F0F4F8', borderRadius: 3 },
    emotionBarFill: { height: '100%', borderRadius: 3 },

    // Tarjeta de Insight
    insightCard: { flexDirection: 'row', backgroundColor: '#EBF1F5', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#DCE4EC', alignItems: 'flex-start' },
    insightIconContainer: { width: 40, height: 40, backgroundColor: '#D4E2EC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    insightContent: { flex: 1, marginLeft: 16 },
    insightTitle: { fontSize: 16, fontWeight: '700', color: '#244B5A', marginBottom: 6 },
    insightText: { fontSize: 14, color: '#486581', lineHeight: 21 }
});
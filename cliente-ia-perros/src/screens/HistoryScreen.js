import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
    // Datos simulados
    const metrics = [
        { id: 1, value: '8', label: 'Total', icon: 'bar-chart-outline' },
        { id: 2, value: '4', label: 'Feliz', icon: 'happy-outline' },
        { id: 3, value: '7', label: 'Esta semana', icon: 'calendar-outline' },
    ];

    const historyData = [
        {
            id: 'group1',
            title: 'HOY',
            items: [
                { id: 101, emotion: 'Feliz', percentage: '94%', note: 'Después del paseo', time: '10:32 AM', icon: 'happy-outline', color: '#22C55E', bgColor: '#DCFCE7' },
                { id: 102, emotion: 'Emocionado', percentage: '88%', note: 'A la hora del desayuno', time: '07:15 AM', icon: 'flash-outline', color: '#F97316', bgColor: '#FFEDD5' }
            ]
        },
        {
            id: 'group2',
            title: 'AYER',
            items: [
                { id: 103, emotion: 'Tranquilo', percentage: '91%', note: '', time: '08:45 PM', icon: 'contrast-outline', color: '#64748B', bgColor: '#F1F5F9' },
                { id: 104, emotion: 'Ansioso', percentage: '76%', note: 'Durante tormenta', time: '03:20 PM', icon: 'alert-circle-outline', color: '#EAB308', bgColor: '#FEF9C3' }
            ]
        },
        {
            id: 'group3',
            title: '28 JUN',
            items: []
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.title}>Historial</Text>
                <View style={styles.subRow}>
                    <Ionicons name="paw-outline" size={16} color="#627D98" style={{ marginRight: 6 }} />
                    <Text style={styles.subtitle}>Seguimiento emocional de Max</Text>
                </View>
            </View>

            {/* Tarjetas de Métricas Superiores */}
            <View style={styles.metricsRow}>
                {metrics.map((metric) => (
                    <View key={metric.id} style={styles.metricCard}>
                        <Ionicons name={metric.icon} size={20} color="#3A536B" />
                        <Text style={styles.metricValue}>{metric.value}</Text>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                    </View>
                ))}
            </View>

            {/* Lista de Registros Agrupados */}
            {historyData.map((group) => (
                <View key={group.id} style={styles.groupContainer}>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-clear-outline" size={14} color="#627D98" />
                        <Text style={styles.dateTitle}>{group.title}</Text>
                    </View>

                    {group.items.length > 0 ? (
                        group.items.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.historyCard}>
                                {/* Icono Emocional Izquierdo */}
                                <View style={[styles.iconBadge, { backgroundColor: item.bgColor }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>

                                {/* Textos del Cuerpo */}
                                <View style={styles.cardContent}>
                                    <View style={styles.emotionRow}>
                                        <Text style={styles.emotionName}>{item.emotion}</Text>
                                        <View style={[styles.percentBadge, { backgroundColor: item.bgColor }]}>
                                            <Text style={[styles.percentText, { color: item.color }]}>{item.percentage}</Text>
                                        </View>
                                    </View>

                                    {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>

                                {/* Chevron Derecho */}
                                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Contenedor vacío por si una fecha no registra datos (como el 28 de Jun en la captura)
                        <View style={styles.emptyGroupCard}>
                            <Text style={styles.emptyGroupText}>Sin registros para este día</Text>
                        </View>
                    )}
                </View>
            ))}
            {/* Margen de seguridad inferior */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#102A43' },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    subtitle: { fontSize: 15, color: '#486581' },

    // Métricas
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    metricCard: {
        backgroundColor: '#FFF',
        width: '31%',
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E9F0',
        elevation: 1,
    },
    metricValue: { fontSize: 22, fontWeight: 'bold', color: '#102A43', marginTop: 4 },
    metricLabel: { fontSize: 12, color: '#627D98', marginTop: 2 },

    // Grupos por Fechas
    groupContainer: { marginBottom: 20 },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
    dateTitle: { fontSize: 13, fontWeight: '700', color: '#627D98', letterSpacing: 0.5 },

    // Tarjetas de Historial
    historyCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E9F0',
        marginBottom: 10,
        elevation: 1,
    },
    iconBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, marginLeft: 14 },
    emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    emotionName: { fontSize: 16, fontWeight: '700', color: '#102A43' },
    percentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    percentText: { fontSize: 12, fontWeight: '700' },
    noteText: { fontSize: 13, color: '#486581', marginTop: 3 },
    timeText: { fontSize: 12, color: '#9FB3C8', marginTop: 2 },

    // Estados Vacíos temporales
    emptyGroupCard: { backgroundColor: '#F0F4F8', borderDash: [4], borderWidth: 1, borderColor: '#D9E2EC', padding: 12, borderRadius: 14, alignItems: 'center' },
    emptyGroupText: { fontSize: 12, color: '#9FB3C8', fontStyle: 'italic' }
});
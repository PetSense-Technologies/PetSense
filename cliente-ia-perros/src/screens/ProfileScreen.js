import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
    const [petData, setPetData] = useState({
        nombre: 'Max',
        raza: 'Golden Retriever',
        edad: '3',
        estado: 'Feliz'
    });
    const [stats, setStats] = useState({ totalEscaneos: '0' });

    // Cargar datos automáticamente al entrar a la pantalla
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const nombre = await AsyncStorage.getItem('mascota_nombre');
                    const raza = await AsyncStorage.getItem('mascota_raza');
                    const edad = await AsyncStorage.getItem('mascota_edad');
                    const estado = await AsyncStorage.getItem('ultimo_estado_detectado');
                    const historial = await AsyncStorage.getItem('historial_escaneos');

                    const listaEscaneos = historial ? JSON.parse(historial) : [];

                    setPetData({
                        nombre: nombre || 'Max',
                        raza: raza || 'Golden Retriever',
                        edad: edad || '3',
                        estado: estado || 'Feliz'
                    });

                    setStats({
                        totalEscaneos: listaEscaneos.length.toString()
                    });
                } catch (e) {
                    console.log("Error cargando datos del perfil", e);
                }
            };
            loadData();
        }, [])
    );

    const achievements = [
        { id: 1, title: '7 días seguidos', desc: 'Rastreando emociones', icon: 'trophy', iconColor: '#EAB308', iconBg: '#FEF9C3' },
        { id: 2, title: 'Súper feliz', desc: 'Emoción más frecuente', icon: 'heart', iconColor: '#EF4444', iconBg: '#FEE2E2' },
        { id: 3, title: 'Alta precisión', desc: '94% de confianza', icon: 'disc', iconColor: '#F97316', iconBg: '#FFEDD5' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Perfil</Text>

            <View style={styles.profileCard}>
                <View style={styles.petInfoRow}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="paw" size={32} color="#BACCD6" />
                    </View>
                    <View style={styles.petTextContainer}>
                        <Text style={styles.petName}>{petData.nombre}</Text>
                        <Text style={styles.petDetails}>{petData.raza} · {petData.edad} años</Text>
                        <View style={styles.statusBadge}>
                            <Ionicons name="happy" size={14} color="#22C55E" />
                            <Text style={styles.statusText}>{petData.estado}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalEscaneos}</Text>
                        <Text style={styles.statLabel}>Escaneos</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>7d</Text>
                        <Text style={styles.statLabel}>Racha</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>86%</Text>
                        <Text style={styles.statLabel}>Humor</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Logros</Text>
                {achievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievementRow}>
                        <View style={[styles.achievementIconContainer, { backgroundColor: achievement.iconBg }]}>
                            <Ionicons name={achievement.icon} size={20} color={achievement.iconColor} />
                        </View>
                        <View style={styles.achievementContent}>
                            <Text style={styles.achievementTitle}>{achievement.title}</Text>
                            <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.btnDashed}>
                <Ionicons name="add" size={20} color="#244B5A" />
                <Text style={styles.btnDashedText}>Agregar otra mascota</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    <Ionicons name="heart-outline" size={12} color="#9FB3C8" /> PetSense v1.0
                </Text>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#102A43', marginBottom: 20 },
    profileCard: { backgroundColor: '#244B5A', borderRadius: 24, padding: 20, marginBottom: 20 },
    petInfoRow: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    petTextContainer: { flex: 1, marginLeft: 16 },
    petName: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
    petDetails: { fontSize: 14, color: '#BACCD6', marginTop: 2, marginBottom: 6 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusText: { color: '#15803D', fontSize: 13, fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    statBox: { backgroundColor: 'rgba(255,255,255,0.08)', width: '31%', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    statLabel: { fontSize: 12, color: '#BACCD6', marginTop: 2 },
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E4E9F0', marginBottom: 20, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#102A43', marginBottom: 16 },
    achievementRow: { flexDirection: 'row', backgroundColor: '#EBF1F5', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 12 },
    achievementIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    achievementContent: { flex: 1, marginLeft: 14 },
    achievementTitle: { fontSize: 15, fontWeight: '700', color: '#102A43' },
    achievementDesc: { fontSize: 13, color: '#627D98', marginTop: 2 },
    btnDashed: { flexDirection: 'row', width: '100%', paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#BCCCDC', borderStyle: 'dashed', backgroundColor: '#EBF1F5', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 25 },
    btnDashedText: { color: '#244B5A', fontSize: 15, fontWeight: '700' },
    footer: { alignItems: 'center', marginBottom: 20, borderTopWidth: 1, borderTopColor: '#E4E9F0', paddingTop: 15 },
    footerText: { fontSize: 12, color: '#9FB3C8', fontWeight: '500' }
});
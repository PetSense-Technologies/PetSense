import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
    const [petData, setPetData] = useState({ nombre: 'Max', raza: 'Golden', edad: '3', estado: 'Feliz' });
    const [stats, setStats] = useState({ totalEscaneos: '12', racha: 0 }); // Racha inicial 0
    const [recompensas, setRecompensas] = useState([]);

    // Base de datos de Recompensas para la Demo
    const listaPremios = [
        { id: 1, rachaReq: 50, titulo: '10% Supermaxi', desc: 'Descuento en comida para mascotas', codigo: 'MAXI-PET-10' },
        { id: 2, rachaReq: 100, titulo: '20% Veterinaria Pedro', desc: 'Descuento en corte de pelaje', codigo: 'PEDRO-CUT-20' },
        { id: 3, rachaReq: 150, titulo: '5% Aqua Park', desc: 'Entrada Pet Friendly con descuento', codigo: 'AQUA-PET-5' },
    ];

    // --- FUNCIÓN PARA LA CASA ABIERTA (SIMULACIÓN EN VIVO) ---
    const simularRacha = () => {
        let nuevaRacha = stats.racha + 50; // Aumenta de 50 en 50 cada vez que tocas
        if (nuevaRacha > 150) nuevaRacha = 0; // Reinicia después de los 150 para volver a mostrar

        setStats(prev => ({ ...prev, racha: nuevaRacha }));

        // Actualizar recompensas visibles instantáneamente
        const ganadas = listaPremios.filter(p => nuevaRacha >= p.rachaReq);
        setRecompensas(ganadas);
    };

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const nombre = await AsyncStorage.getItem('mascota_nombre');
                const raza = await AsyncStorage.getItem('mascota_raza');
                const edad = await AsyncStorage.getItem('mascota_edad');
                const estado = await AsyncStorage.getItem('ultimo_estado_detectado');
                const historialRaw = await AsyncStorage.getItem('historial_escaneos');
                const lista = historialRaw ? JSON.parse(historialRaw) : [];

                setPetData({
                    nombre: nombre || 'Max',
                    raza: raza || 'Golden',
                    edad: edad || '3',
                    estado: estado || 'Feliz'
                });

                // Mantenemos los escaneos reales pero la racha la controlamos nosotros para la demo
                setStats(prev => ({ ...prev, totalEscaneos: lista.length.toString() }));
            };
            loadData();
        }, [])
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header con las dos huellas 🐾 */}
            <Text style={styles.sectionTitle}>
                <Ionicons name="paw" size={24} color="#FF6D3F" />
                <Ionicons name="paw" size={18} color="#FF6D3F" style={{ opacity: 0.6 }} />
                {" "}Perfil
            </Text>

            <View style={styles.profileCard}>
                <View style={styles.petInfoRow}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="paw" size={34} color="#BACCD6" />
                    </View>
                    <View style={styles.petTextContainer}>
                        <Text style={styles.petName}>{petData.nombre}</Text>
                        <Text style={styles.petDetails}>{petData.raza} · {petData.edad} años</Text>
                        <View style={styles.statusBadge}>
                            <Ionicons name="happy" size={14} color="#15803D" />
                            <Text style={styles.statusText}>{petData.estado}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalEscaneos}</Text>
                        <Text style={styles.statLabel}>Escaneos</Text>
                    </View>

                    {/* BOTÓN SECRETO PARA LA DEMO: Al tocar la Racha, aumenta */}
                    <TouchableOpacity style={styles.statBox} onPress={simularRacha}>
                        <Text style={[styles.statValue, { color: stats.racha > 0 ? '#FFD700' : '#FFF' }]}>
                            {stats.racha}d
                        </Text>
                        <Text style={[styles.statLabel, { color: stats.racha > 0 ? '#FFD700' : '#BACCD6' }]}>Racha 🔥</Text>
                    </TouchableOpacity>

                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>86%</Text>
                        <Text style={styles.statLabel}>Humor</Text>
                    </View>
                </View>
            </View>

            {/* SECCIÓN DE RECOMPENSAS */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Mis Recompensas</Text>
                {recompensas.length > 0 ? recompensas.map((premio) => (
                    <View key={premio.id} style={styles.couponRow}>
                        <View style={styles.couponIcon}>
                            <Ionicons name="gift" size={24} color="#FF6D3F" />
                        </View>
                        <View style={styles.couponContent}>
                            <Text style={styles.couponTitle}>{premio.titulo}</Text>
                            <Text style={styles.couponDesc}>{premio.desc}</Text>
                            <Text style={styles.couponCode}>CÓDIGO: {premio.codigo}</Text>
                        </View>
                    </View>
                )) : (
                    <View style={styles.emptyRewards}>
                        <Ionicons name="lock-closed-outline" size={30} color="#9FB3C8" />
                        <Text style={styles.emptyRewardsText}>
                            Mantén tu racha para desbloquear premios en Supermaxi y más.
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.btnDashed}>
                <Ionicons name="add" size={20} color="#244B5A" />
                <Text style={styles.btnDashedText}>Agregar otra mascota</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9', paddingHorizontal: 24, paddingTop: 50 },
    sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#102A43', marginBottom: 20 },
    profileCard: { backgroundColor: '#244B5A', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 8 },
    petInfoRow: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    petTextContainer: { flex: 1, marginLeft: 16 },
    petName: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
    petDetails: { fontSize: 14, color: '#BACCD6', marginTop: 2, marginBottom: 8 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 4 },
    statusText: { color: '#15803D', fontSize: 12, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    statBox: { backgroundColor: 'rgba(255,255,255,0.08)', width: '31%', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    statLabel: { fontSize: 12, color: '#BACCD6' },
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E4E9F0', marginBottom: 20 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#102A43', marginBottom: 15 },
    couponRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7F5', borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#FFD7CC' },
    couponIcon: { width: 45, height: 45, backgroundColor: '#FF6D3F22', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    couponContent: { flex: 1 },
    couponTitle: { fontSize: 15, fontWeight: 'bold', color: '#132F35' },
    couponDesc: { fontSize: 12, color: '#6B8086', marginTop: 2 },
    couponCode: { fontSize: 12, fontWeight: 'bold', color: '#FF6D3F', marginTop: 5, letterSpacing: 1 },
    emptyRewards: { padding: 20, alignItems: 'center' },
    emptyRewardsText: { textAlign: 'center', color: '#9FB3C8', fontSize: 13, marginTop: 10 },
    btnDashed: { flexDirection: 'row', width: '100%', paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#BCCCDC', borderStyle: 'dashed', backgroundColor: '#EBF1F5', justifyContent: 'center', alignItems: 'center', gap: 8 },
});
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [petData, setPetData] = useState({ nombre: '...', raza: '...', edad: '...', estado: '...' });
    const [stats, setStats] = useState({ totalEscaneos: '0', racha: 0 });
    const [recompensas, setRecompensas] = useState([]);

    const listaPremios = [
        { id: 1, rachaReq: 50, titulo: '10% Supermaxi', desc: 'Descuento en comida para mascotas', codigo: 'MAXI-PET-10' },
        { id: 2, rachaReq: 100, titulo: '20% Veterinaria Pedro', desc: 'Descuento en corte de pelaje', codigo: 'PEDRO-CUT-20' },
        { id: 3, rachaReq: 150, titulo: '5% Aqua Park', desc: 'Entrada Pet Friendly con descuento', codigo: 'AQUA-PET-5' },
        { id: 4, rachaReq: 200, titulo: '15% PetShop El Bosque', desc: 'Juguetes y accesorios', codigo: 'BOSQUE-PET-15' },
        { id: 5, rachaReq: 300, titulo: 'Baño Gratis', desc: 'En Veterinaria Mundo Animal', codigo: 'FREE-BATH-0' },
        { id: 6, rachaReq: 500, titulo: 'Kit de Bienvenida', desc: 'Regalo especial en PetSense', codigo: 'GIFT-KIT-500' },
    ];

    const simularRacha = () => {
        let nuevaRacha = stats.racha + 50;
        if (nuevaRacha > 500) nuevaRacha = 0;
        setStats(prev => ({ ...prev, racha: nuevaRacha }));
        const ganadas = listaPremios.filter(p => nuevaRacha >= p.rachaReq);
        setRecompensas(ganadas);
        if (nuevaRacha > 0) Alert.alert("Felicidades!!", `Haz alcanzado ${nuevaRacha} días de racha, te espera un premio.`);
    };

    const loadProfile = async () => {
        try {
            const id = await AsyncStorage.getItem('mascota_id_real');
            if (!id) return;
            const response = await fetch(`http://192.168.18.3:8000/mascotas/${id}/perfil`);
            const data = await response.json();
            if (data.status === 'success') {
                setPetData({
                    nombre: data.nombre,
                    raza: data.raza,
                    edad: data.edad.toString(),
                    estado: data.ultima_emocion
                });
                setStats({ totalEscaneos: data.total_escaneos.toString(), racha: data.racha_actual });
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadProfile(); }, []));

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6D3F" /></View>;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Perfil</Text>

            {/* Perfil Real */}
            <View style={styles.profileCard}>
                <View style={styles.petInfoRow}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="paw" size={34} color="#BACCD6" />
                    </View>

                    <View style={styles.petTextContainer}>
                        <Text style={styles.petName}>{petData.nombre}</Text>
                        <Text style={styles.petDetails}>
                            {petData.raza} · {petData.edad} meses
                        </Text>

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

                    <TouchableOpacity
                        style={styles.statBox}
                        onPress={simularRacha}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.statValue,
                                { color: stats.racha > 0 ? "#FFD700" : "#FFF" }
                            ]}
                        >
                            {stats.racha}d
                        </Text>

                        <Text
                            style={[
                                styles.statLabel,
                                { color: stats.racha > 0 ? "#FFD700" : "#BACCD6" }
                            ]}
                        >
                            Racha 🔥
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>95%</Text>
                        <Text style={styles.statLabel}>Humor</Text>
                    </View>
                </View>
            </View>

            {/* SECCIÓN DE RECOMPENSAS */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Mis Recompensas</Text>

                {recompensas.length > 0 ? (
                    recompensas.map((premio) => (
                        <View key={premio.id} style={styles.couponRow}>
                            <View style={styles.couponIcon}>
                                <Ionicons name="gift" size={24} color="#FF6D3F" />
                            </View>

                            <View style={styles.couponContent}>
                                <Text style={styles.couponTitle}>{premio.titulo}</Text>
                                <Text style={styles.couponDesc}>{premio.desc}</Text>
                                <Text style={styles.couponCode}>
                                    CÓDIGO: {premio.codigo}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyRewards}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={30}
                            color="#9FB3C8"
                        />
                        <Text style={styles.emptyRewardsText}>
                            Mantén tu racha para desbloquear premios.
                        </Text>
                    </View>
                )}
            </View>

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
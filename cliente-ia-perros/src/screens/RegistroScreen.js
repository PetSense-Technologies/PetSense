import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.18.3:8000';

export default function RegistroScreen({ navigation }) {
    const [nombreDueno, setNombreDueno] = useState('');
    const [celular, setCelular] = useState('');
    const [direccion, setDireccion] = useState('');
    const [nombreMascota, setNombreMascota] = useState('');
    const [raza, setRaza] = useState('');
    const [edadMeses, setEdadMeses] = useState('');
    const [loading, setLoading] = useState(false);

    const ejecutarRegistroReal = async () => {
        if (!nombreDueno || !celular || !nombreMascota) {
            Alert.alert('Datos incompletos', 'Por favor ingresa los campos obligatorios (*).');
            return;
        }

        try {
            setLoading(true);

            const params = new URLSearchParams({
                nombre_dueno: nombreDueno,
                celular: celular,
                direccion: direccion || '',
                nombre_mascota: nombreMascota,
                raza: raza || 'Mestizo',
                edad_meses: edadMeses ? parseInt(edadMeses).toString() : '0'
            });

            const response = await fetch(`${API_BASE_URL}/mascotas/registro?${params.toString()}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error en el servidor: Código ${response.status}`);
            }

            const data = await response.json();
            const mascotaIdGenerado = data.mascota_id;

            if (!mascotaIdGenerado) {
                throw new Error("El servidor no devolvió un ID de mascota válido.");
            }

            // Guardado persistente para ProfileScreen
            await AsyncStorage.setItem('mascota_id_real', String(mascotaIdGenerado));
            await AsyncStorage.setItem('mascota_nombre', nombreMascota);
            await AsyncStorage.setItem('mascota_raza', raza || 'Mestizo');
            await AsyncStorage.setItem('mascota_edad', edadMeses ? Math.round(parseInt(edadMeses) / 12).toString() : '0');

            Alert.alert('¡Éxito!', `Se registró a ${nombreMascota} correctamente`);
            navigation.navigate('MenuPrincipal');

        } catch (error) {
            Alert.alert('Error en registro', error.message || 'No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#132F35" />
            <View style={styles.header}>
                <View style={styles.headerBadge}><Ionicons name="paw" size={18} color="#FFF" /></View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Crear cuenta</Text>
                    <Text style={styles.headerSubtitle}>Empieza a entender a tu mascota hoy</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.ownerCardHeader}>
                        <Ionicons name="person-outline" size={16} color="#1E3E47" style={styles.sectionIcon} />
                        <Text style={styles.ownerHeaderText}>INFORMACIÓN DEL DUEÑO</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Nombre completo *" placeholderTextColor="#9BAEAF" value={nombreDueno} onChangeText={setNombreDueno} />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Celular *" placeholderTextColor="#9BAEAF" keyboardType="phone-pad" value={celular} onChangeText={setCelular} />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Dirección" placeholderTextColor="#9BAEAF" value={direccion} onChangeText={setDireccion} />
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.petCardHeader}>
                        <Ionicons name="paw-outline" size={16} color="#FF6D3F" style={styles.sectionIcon} />
                        <Text style={styles.petHeaderText}>INFORMACIÓN DE TU MASCOTA</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="paw-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Nombre del perrito *" placeholderTextColor="#9BAEAF" value={nombreMascota} onChangeText={setNombreMascota} />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="sparkles-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Raza" placeholderTextColor="#9BAEAF" value={raza} onChangeText={setRaza} />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="calendar-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Edad en meses" placeholderTextColor="#9BAEAF" keyboardType="numeric" value={edadMeses} onChangeText={setEdadMeses} />
                        </View>
                    </View>
                </View>

                <Text style={styles.legendText}>* Campos requeridos</Text>

                <TouchableOpacity style={styles.actionButton} onPress={ejecutarRegistroReal} disabled={loading} activeOpacity={0.9}>
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Text style={styles.buttonText}>Continuar al Escáner</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: { flex: 1, backgroundColor: '#F3F6F8' },
    header: { backgroundColor: '#132F35', flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    headerTextContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    headerSubtitle: { fontSize: 13, color: '#A0B4B7', marginTop: 2 },
    scrollContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
    card: { backgroundColor: '#FFF', width: '100%', borderRadius: 14, borderWidth: 1, borderColor: '#E6ECEF', marginBottom: 20, overflow: 'hidden' },
    ownerCardHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECF2F4', paddingVertical: 12, paddingHorizontal: 16 },
    ownerHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#132F35', letterSpacing: 0.8 },
    petCardHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6ECE8', paddingVertical: 12, paddingHorizontal: 16 },
    petHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#FF6D3F', letterSpacing: 0.8 },
    sectionIcon: { marginRight: 8 },
    cardBody: { paddingHorizontal: 16, paddingVertical: 18, gap: 12 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF1F3', borderWidth: 1.5, borderColor: '#DFE5E8', borderRadius: 12, height: 48, paddingHorizontal: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#132F35', fontSize: 14, fontWeight: '500' },
    legendText: { fontSize: 12, color: '#899E9F', alignSelf: 'center', marginBottom: 25 },
    actionButton: { flexDirection: 'row', backgroundColor: '#1E3E47', width: width - 32, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginRight: 8 }
});
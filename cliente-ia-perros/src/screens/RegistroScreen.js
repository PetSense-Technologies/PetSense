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
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');



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

            // Petición POST
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

            // Se guarda el ID en la memoria del teléfono para el Escáner e Historial
            await AsyncStorage.setItem('mascota_id_real', String(mascotaIdGenerado));

            Alert.alert('¡Éxito!', `Se registró a ${nombreMascota} correctamente`);

            // Avanzamos a la pantalla de crear perfil para la captura de fotos
            navigation.navigate('CrearPerfil');

        } catch (error) {
            Alert.alert('Error en registro', error.message || 'No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#132F35" />

            {/* Header corporativo estilo image_7016c5.png */}
            <View style={styles.header}>
                <View style={styles.headerBadge}>
                    <Ionicons name="paw" size={18} color="#FFF" />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Crear cuenta</Text>
                    <Text style={styles.headerSubtitle}>Empieza a entender a tu mascota hoy</Text>
                </View>
            </View>

            {/* Scroll de los formularios */}
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* CARD 1: INFORMACIÓN DEL DUEÑO */}
                <View style={styles.card}>
                    <View style={styles.ownerCardHeader}>
                        <Ionicons name="person-outline" size={16} color="#1E3E47" style={styles.sectionIcon} />
                        <Text style={styles.ownerHeaderText}>INFORMACIÓN DEL DUEÑO</Text>
                    </View>

                    <View style={styles.cardBody}>
                        {/* Campo Nombre Completo */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre completo *"
                                placeholderTextColor="#9BAEAF"
                                value={nombreDueno}
                                onChangeText={setNombreDueno}
                            />
                        </View>

                        {/* Campo Celular */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Celular *"
                                placeholderTextColor="#9BAEAF"
                                keyboardType="phone-pad"
                                value={celular}
                                onChangeText={setCelular}
                            />
                        </View>

                        {/* Campo Dirección */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección"
                                placeholderTextColor="#9BAEAF"
                                value={direccion}
                                onChangeText={setDireccion}
                            />
                        </View>
                    </View>
                </View>

                {/* CARD 2: INFORMACIÓN DE TU MASCOTA */}
                <View style={styles.card}>
                    <View style={styles.petCardHeader}>
                        <Ionicons name="paw-outline" size={16} color="#FF6D3F" style={styles.sectionIcon} />
                        <Text style={styles.petHeaderText}>INFORMACIÓN DE TU MASCOTA</Text>
                    </View>

                    <View style={styles.cardBody}>
                        {/* Campo Nombre del Perrito */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="paw-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del perrito *"
                                placeholderTextColor="#9BAEAF"
                                value={nombreMascota}
                                onChangeText={setNombreMascota}
                            />
                        </View>

                        {/* Campo Raza */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="sparkles-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Raza"
                                placeholderTextColor="#9BAEAF"
                                value={raza}
                                onChangeText={setRaza}
                            />
                        </View>

                        {/* Campo Edad */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="calendar-outline" size={18} color="#6B8086" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Edad en meses"
                                placeholderTextColor="#9BAEAF"
                                keyboardType="numeric"
                                value={edadMeses}
                                onChangeText={setEdadMeses}
                            />
                        </View>
                    </View>
                </View>

                {/* Leyenda de campos obligatorios */}
                <Text style={styles.legendText}>* Campos requeridos</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={ejecutarRegistroReal}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.buttonText}>Continuar al Escáner</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.arrowIcon} />
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#F3F6F8',
    },
    header: {
        backgroundColor: '#132F35',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerBadge: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#A0B4B7',
        marginTop: 2,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6ECEF',
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    ownerCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECF2F4',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    ownerHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#132F35',
        letterSpacing: 0.8,
    },
    petCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6ECE8',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    petHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF6D3F',
        letterSpacing: 0.8,
    },
    sectionIcon: {
        marginRight: 8,
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF1F3',
        borderWidth: 1.5,
        borderColor: '#DFE5E8',
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#132F35',
        fontSize: 14,
        fontWeight: '500',
    },
    legendText: {
        fontSize: 12,
        color: '#899E9F',
        alignSelf: 'center',
        marginBottom: 25,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#1E3E47',
        width: width - 32,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E3E47',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        marginRight: 8,
    },
    arrowIcon: {
        marginTop: 1,
    }
});
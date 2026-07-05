import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

            // 1. Registrar Dueño en el Backend
            const resDueno = await fetch(`${API_BASE_URL}/duenos/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_dueno: nombreDueno,
                    celular: celular,
                    direccion: direccion || null
                }),
            });
            const dataDueno = await resDueno.json();
            if (dataDueno.status !== 'success') throw new Error(dataDueno.message);

            // 2. Registrar Mascota en el Backend vinculada a ese dueño
            const resMascota = await fetch(`${API_BASE_URL}/mascotas/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dueno_id: dataDueno.dueno.id,
                    nombre_mascota: nombreMascota,
                    raza: raza || 'Mestizo',
                    edad_meses: edadMeses ? parseInt(edadMeses) : null
                }),
            });
            const dataMascota = await resMascota.json();
            if (dataMascota.status !== 'success') throw new Error(dataMascota.message);

            const mascotaIdGenerado = dataMascota.mascota.id;

            // 3. Guardamos el ID real en la memoria del teléfono
            await AsyncStorage.setItem('mascota_id_real', mascotaIdGenerado.toString());

            Alert.alert('¡Éxito!', `Se registró a ${nombreMascota} correctamente.`);

            // Avanzamos al Escáner en tu flujo lineal sin pasar parámetros raros
            navigation.navigate('Escaner');

        } catch (error) {
            Alert.alert('Error en registro', error.message || 'No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Paso 2: Registro Inicial</Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Información del Dueño</Text>
                <TextInput style={styles.input} placeholder="Nombre completo *" value={nombreDueno} onChangeText={setNombreDueno} />
                <TextInput style={styles.input} placeholder="Celular *" keyboardType="phone-pad" value={celular} onChangeText={setCelular} />
                <TextInput style={styles.input} placeholder="Dirección" value={direccion} onChangeText={setDireccion} />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Información de tu Mascota</Text>
                <TextInput style={styles.input} placeholder="Nombre del perrito *" value={nombreMascota} onChangeText={setNombreMascota} />
                <TextInput style={styles.input} placeholder="Raza" value={raza} onChangeText={setRaza} />
                <TextInput style={styles.input} placeholder="Edad en meses" keyboardType="numeric" value={edadMeses} onChangeText={setEdadMeses} />
            </View>

            <TouchableOpacity style={styles.btn} onPress={ejecutarRegistroReal} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Continuar al Escáner</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#F1F5F9', flexGrow: 1 },
    header: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2563EB' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#334155' },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, padding: 10, marginBottom: 10 },
    btn: { backgroundColor: '#10B981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
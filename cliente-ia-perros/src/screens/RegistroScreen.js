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

            // Armamos los Query Parameters tal y como los pide tu main.py en los argumentos de la función
            const params = new URLSearchParams({
                nombre_dueno: nombreDueno,
                celular: celular,
                direccion: direccion || '',
                nombre_mascota: nombreMascota,
                raza: raza || 'Mestizo',
                edad_meses: edadMeses ? parseInt(edadMeses).toString() : '0'
            });


            // Hacemos una única petición POST al endpoint unificado de tu backend
            const response = await fetch(`${API_BASE_URL}/mascotas/registro?${params.toString()}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error en el servidor: Código ${response.status}`);
            }

            const data = await response.json();

            // Dependiendo de cómo devuelva la respuesta tu función en Python, extraemos el ID.
            // Si tu endpoint retorna directamente el objeto mascota creado, o un ID suelto, lo guardamos aquí:
            const mascotaIdGenerado = data.id || (data.mascota && data.mascota.id) || '1';

            // Guardamos el ID real en la memoria del teléfono para el Escáner
            await AsyncStorage.setItem('mascota_id_real', mascotaIdGenerado.toString());

            Alert.alert('¡Éxito!', `Se registró a ${nombreMascota} correctamente. `);

            // Rompemos el estancamiento y avanzamos fluidamente a la pantalla del Escáner
            navigation.navigate('MenuPrincipal');

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
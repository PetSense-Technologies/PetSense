import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil de la Mascota</Text>
            <Text style={styles.subtitle}>Datos de emergencia del dueño, insignias y logros conseguidos 🏆</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 8 }
});
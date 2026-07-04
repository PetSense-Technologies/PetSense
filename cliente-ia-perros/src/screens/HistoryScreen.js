import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial de Emociones</Text>
            <Text style={styles.subtitle}>Aquí verás las conductas anteriores y tus rachas diarias 🔥</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }
});
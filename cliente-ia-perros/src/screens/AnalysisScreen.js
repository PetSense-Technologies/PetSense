import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AnalysisScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Análisis Semanal</Text>
            <Text style={styles.subtitle}>Diagramas de barras y métricas avanzadas de humor 📊</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }
});
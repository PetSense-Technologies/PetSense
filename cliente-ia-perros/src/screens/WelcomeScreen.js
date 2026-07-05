import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Zona del Logotipo / Icono */}
            <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🐾</Text>
                <Text style={styles.brand}>PetSense</Text>
                <Text style={styles.tagline}>Entiende las emociones de tu mejor amigo</Text>
            </View>

            {/* Contenido Informativo Corto */}
            <View style={styles.infoCard}>
                <Ionicons name="sparkles" size={24} color="#2563EB" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                    Utiliza nuestra Inteligencia Artificial para analizar el estado de ánimo de tu mascota a través de fotos en tiempo real.
                </Text>
            </View>

            {/* Botón de Acción Principal */}
            <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Registro')}
            >
                <Text style={styles.btnText}>Comenzar Registro</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 60
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40
    },
    logoEmoji: {
        fontSize: 70,
        marginBottom: 10
    },
    brand: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B'
    },
    tagline: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
        textAlign: 'center'
    },
    infoCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoIcon: {
        marginRight: 14
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20
    },
    btnPrimary: {
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        elevation: 2
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
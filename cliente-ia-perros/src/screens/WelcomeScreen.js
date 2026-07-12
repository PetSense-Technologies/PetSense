import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const [isSplash, setIsSplash] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);

    // Animaciones
    const splashOpacity = useRef(new Animated.Value(1)).current;
    const welcomeOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Verificar estado de registro en segundo plano
        const checkStatus = async () => {
            const id = await AsyncStorage.getItem('mascota_id_real');
            setIsRegistered(!!id);
        };
        checkStatus();

        // Animación de pulso cíclica para el Splash
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Temporizador para pasar del Splash al Welcome (700ms)
        const timer = setTimeout(() => {
            Animated.sequence([
                Animated.timing(splashOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(welcomeOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setIsSplash(false);
            });
        }, 700);

        return () => clearTimeout(timer);
    }, []);

    // Función de navegación inteligente
    const handleNavigation = async () => {
        try {
            const idGuardado = await AsyncStorage.getItem('mascota_id_real');

            if (idGuardado !== null) {
                // Usuario registrado: Ir al Menú (usamos replace para no volver atrás)
                navigation.replace('MenuPrincipal');
            } else {
                // Usuario nuevo: Ir a Registro
                navigation.navigate('Registro');
            }
        } catch (e) {
            console.error("Error al leer sesión:", e);
            navigation.navigate('Registro');
        }
    };

    if (isSplash) {
        return (
            <View style={styles.splashContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#0D1F24" />
                <Animated.View style={[styles.splashLogoWrapper, { opacity: splashOpacity, transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="paw" size={80} color="#FF6D3F" />
                    <Text style={styles.splashBrand}>PETSENSE</Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.welcomeContainer, { opacity: welcomeOpacity }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D1F24" />

            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="paw" size={20} color="#FF6D3F" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>PETSENSE</Text>
            </View>

            {/* Zona Central con el nuevo Logo */}
            <View style={styles.centerArea}>
                <View style={styles.outerGlow}>
                    <View style={styles.middleGlow}>
                        <View style={styles.innerGlow}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/dog_logo.png')} // RUTA CORREGIDA PARA TU ESTRUCTURA
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Texto Promocional */}
            <View style={styles.textContainer}>
                <Text style={styles.tagline}>
                    Detecta sus emociones <Text style={styles.accentText}>con</Text>
                </Text>
                <Text style={styles.accentText}>una sola foto.</Text>
            </View>

            {/* Footer y Botón */}
            <View style={styles.footer}>
                <View style={styles.indicatorLine} />

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNavigation}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>
                        {isRegistered ? "Continuar" : "Comenzar registro"}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.arrowIcon} />
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    Al continuar aceptas los Términos y Política de privacidad
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#0D1F24',
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashLogoWrapper: {
        alignItems: 'center',
    },
    splashBrand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 15,
        letterSpacing: 2,
    },
    welcomeContainer: {
        flex: 1,
        backgroundColor: '#0D1F24',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 50,
        paddingHorizontal: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    headerIcon: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1.5,
    },
    centerArea: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.4,
    },
    outerGlow: {
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(255, 109, 63, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.015)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleGlow: {
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: 'rgba(255, 109, 63, 0.03)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.025)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerGlow: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 109, 63, 0.04)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 110,
        height: 110,
        borderRadius: 55, // Circular para integrar mejor la imagen del perro
        backgroundColor: '#1E2D32',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#293E45',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    logoImage: {
        width: '90%',
        height: '90%',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    tagline: {
        fontSize: 19,
        fontWeight: '600',
        color: '#FFF',
    },
    accentText: {
        color: '#FF6D3F',
        fontWeight: '700',
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    indicatorLine: {
        width: 40,
        height: 4,
        backgroundColor: '#FFF',
        borderRadius: 2,
        marginBottom: 25,
        opacity: 0.8,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#FF6D3F',
        width: width - 60,
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#FF6D3F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',
        marginRight: 10,
    },
    arrowIcon: {
        marginTop: 2,
    },
    termsText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        marginTop: 5,
    }
});
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

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const [isSplash, setIsSplash] = useState(true);

    const splashOpacity = useRef(new Animated.Value(1)).current;
    const welcomeOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                })
            ])
        ).start();

        const timer = setTimeout(() => {
            Animated.sequence([
                Animated.timing(splashOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(welcomeOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setIsSplash(false);
            });
        }, 700);

        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        if (navigation) {
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

            <View style={styles.header}>
                <Ionicons name="paw" size={20} color="#FF6D3F" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>PETSENSE</Text>
            </View>

            <View style={styles.centerArea}>
                <View style={styles.outerGlow}>
                    <View style={styles.middleGlow}>
                        <View style={styles.innerGlow}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/dog_logo.png')} // RUTA CORREGIDA
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.tagline}>
                    Detecta sus emociones <Text style={styles.accentText}>con</Text>
                </Text>
                <Text style={styles.accentText}>una sola foto.</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.indicatorLine} />

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleStart}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>Comenzar registro</Text>
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
    splashContainer: { flex: 1, backgroundColor: '#0D1F24', justifyContent: 'center', alignItems: 'center' },
    splashLogoWrapper: { justifyContent: 'center', alignItems: 'center' },
    splashBrand: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 15, letterSpacing: 2 },
    welcomeContainer: { flex: 1, backgroundColor: '#0D1F24', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 50, paddingHorizontal: 30 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    headerIcon: { marginRight: 8 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
    centerArea: { justifyContent: 'center', alignItems: 'center', height: height * 0.4 },
    outerGlow: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255, 109, 63, 0.02)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.015)', justifyContent: 'center', alignItems: 'center' },
    middleGlow: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255, 109, 63, 0.03)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.025)', justifyContent: 'center', alignItems: 'center' },
    innerGlow: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255, 109, 63, 0.04)', justifyContent: 'center', alignItems: 'center' },
    logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E2D32', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    logoImage: { width: '100%', height: '100%' },
    textContainer: { alignItems: 'center', marginBottom: 20 },
    tagline: { fontSize: 18, fontWeight: '600', color: '#FFF', textAlign: 'center' },
    accentText: { color: '#FF6D3F', fontWeight: '700', fontSize: 18, textAlign: 'center', marginTop: 4 },
    footer: { width: '100%', alignItems: 'center' },
    indicatorLine: { width: 40, height: 4, backgroundColor: '#FFF', borderRadius: 2, marginBottom: 25, opacity: 0.9 },
    actionButton: { flexDirection: 'row', backgroundColor: '#FF6D3F', width: width - 60, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#FF6D3F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    arrowIcon: { marginTop: 1 },
    termsText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center', marginTop: 5 }
});
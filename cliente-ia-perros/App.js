import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa tus componentes
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import ScanerScreen from './src/screens/ScannerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegistroBiometrico from './src/screens/RegistroBiometrico';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// MENÚ INFERIOR FLOTANTE
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'EscanerTab') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'HistorialTab') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'AnalisisTab') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'PerfilTab') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#15803D',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          position: 'absolute', bottom: 20, left: 16, right: 16,
          backgroundColor: '#FFF', borderRadius: 24, height: 64,
          paddingBottom: 8, paddingTop: 8, elevation: 8,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1, shadowRadius: 8, borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="EscanerTab" component={ScanerScreen} options={{ title: 'Escanear' }} />
      <Tab.Screen name="HistorialTab" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Tab.Screen name="AnalisisTab" component={AnalysisScreen} options={{ title: 'Análisis' }} />
      <Tab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// NAVEGACIÓN GENERAL CON COMPROBACIÓN DE DISPOSITIVO
export default function AppNavigator() {
  const [isRegistrado, setIsRegistrado] = useState(null);

  useEffect(() => {
    const verificarRegistro = async () => {
      try {
        // Buscamos si este dispositivo ya tiene un ID guardado
        const idGuardado = await AsyncStorage.getItem('mascota_id_real');
        if (idGuardado !== null) {
          setIsRegistrado(true); // Si ya esta registro lo manda directo al menu
        } else {
          setIsRegistrado(false); // Si detecta un dispositivo nuevo manda al menu de registro
        }
      } catch (e) {
        setIsRegistrado(false);
      }
    };
    verificarRegistro();
  }, []);

  // Mientras lee el almacenamiento local, muestra una pantalla de carga limpia
  if (isRegistrado === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* SIEMPRE inicia en Bienvenida (WelcomeScreen) */}
      <Stack.Navigator initialRouteName="Bienvenida" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Bienvenida" component={WelcomeScreen} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="RegistroBiometrico" component={RegistroBiometrico} />
        <Stack.Screen name="MenuPrincipal" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
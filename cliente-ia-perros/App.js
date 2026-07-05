import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importa tus componentes (Verificados con tus rutas exactas)
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import ScanerScreen from './src/screens/ScannerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Creación la barra inferior flotante
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'EscanerTab') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'HistorialTab') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'AnalisisTab') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'PerfilTab') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        //Efecto píldora flotante despegada del suelo
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          backgroundColor: '#FFF',
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8, // Sombra para Android
          shadowColor: '#000', // Sombra para iOS
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderTopWidth: 0,
        },
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#FFF',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="EscanerTab" component={ScanerScreen} options={{ title: 'Escanear' }} />
      <Tab.Screen name="HistorialTab" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Tab.Screen name="AnalisisTab" component={AnalysisScreen} options={{ title: 'Análisis' }} />
      <Tab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// NAVEGACIÓN GENERAL DE TU APP
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Bienvenida"
        screenOptions={{
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#FFF',
          headerTitleAlign: 'center',
        }}
      >
        {/* 1. BIENVENIDA (Pantalla completa sin barra) */}
        <Stack.Screen
          name="Bienvenida"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* 2. REGISTRO (Pantalla completa sin barra) */}
        <Stack.Screen
          name="Registro"
          component={RegistroScreen}
          options={{ title: 'Registro Inicial' }}
        />

        {/* 3. MENÚ PRINCIPAL FLOTANTE */}
        {/* Aquí es donde agrupamos las 4 pantallas restantes con la barra inferior */}
        <Stack.Screen
          name="MenuPrincipal"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
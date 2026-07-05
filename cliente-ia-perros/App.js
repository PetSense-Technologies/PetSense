import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa tus componentes
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import EscanerScreen from './src/screens/EscanerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalisisScreen from './src/screens/AnalisisScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

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
        {/* 1. BIENVENIDA */}
        <Stack.Screen
          name="Bienvenida"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* 2. REGISTRO (Alimenta la BD real y pasa el mascota_id en la navegación) */}
        <Stack.Screen
          name="Registro"
          component={RegistroScreen}
          options={{ title: 'Registro Inicial' }}
        />

        {/* 3. ESCANER */}
        <Stack.Screen
          name="Escaner"
          component={EscanerScreen}
          options={{ title: 'Escanear Mascota' }}
        />

        {/* 4. HISTORIAL */}
        <Stack.Screen
          name="Historial"
          component={HistoryScreen}
          options={{ title: 'Historial de Emociones' }}
        />

        {/* 5. ANALISIS */}
        <Stack.Screen
          name="Analisis"
          component={AnalisisScreen}
          options={{ title: 'Análisis de Datos' }}
        />

        {/* 6. PERFIL */}
        <Stack.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{ title: 'Mi Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
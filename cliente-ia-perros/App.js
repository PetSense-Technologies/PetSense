import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importación de las pantallas
import ScannerScreen from './src/screens/ScannerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#244B5A',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 10 },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            // Ionicons
            if (route.name === 'Escáner') iconName = 'qr-code-outline';
            else if (route.name === 'Historial') iconName = 'time-outline';
            else if (route.name === 'Análisis') iconName = 'bar-chart-outline';
            else if (route.name === 'Perfil') iconName = 'person-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Escáner" component={ScannerScreen} />
        <Tab.Screen name="Historial" component={HistoryScreen} />
        <Tab.Screen name="Análisis" component={AnalysisScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
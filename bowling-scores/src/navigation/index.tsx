import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PlayerSetupScreen from '../screens/PlayerSetupScreen';
import GameScreen from '../screens/GameScreen';
import GameSummaryScreen from '../screens/GameSummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';

// Import types
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style='auto' />
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='PlayerSetup' component={PlayerSetupScreen} />
        <Stack.Screen name='Game' component={GameScreen} />
        <Stack.Screen name='GameSummary' component={GameSummaryScreen} />
        <Stack.Screen name='History' component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

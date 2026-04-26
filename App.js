import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import MatrizIsolamentoScreen from './src/features/matriz-isolamento/screens/MatrizIsolamentoScreen';
import RelatorioTurnoScreen from './src/screens/RelatorioTurnoScreen';

import { AuthProvider } from './src/context/AuthContext';
import LoginModal from './src/components/LoginModal';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('home');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (activeScreen === 'relatorio-turno') {
    return (
      <View style={styles.container}>
        <RelatorioTurnoScreen
          onVoltar={() => setActiveScreen('home')}
          onBack={() => setActiveScreen('home')}
        />

        <LoginModal visible={!showSplash} />
      </View>
    );
  }

  if (activeScreen === 'matriz-isolamento') {
    return (
      <View style={styles.container}>
        <MatrizIsolamentoScreen onBack={() => setActiveScreen('home')} />

        <LoginModal visible={!showSplash} />
      </View>
    );
  }

  if (activeScreen === 'weather') {
    return (
      <View style={styles.container}>
        <WeatherScreen onBack={() => setActiveScreen('home')} />

        <LoginModal visible={!showSplash} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeScreen
        onOpenRelatorioTurno={() => setActiveScreen('relatorio-turno')}
        onOpenMatrizIsolamento={() => setActiveScreen('matriz-isolamento')}
        onOpenWeather={() => setActiveScreen('weather')}
      />

      <LoginModal visible={!showSplash} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
import React, { useState } from 'react';

import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import MatrizIsolamentoScreen from './src/features/matriz-isolamento/screens/MatrizIsolamentoScreen';
import RelatorioTurnoScreen from './src/screens/RelatorioTurnoScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('home');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (activeScreen === 'relatorio-turno') {
    return (
      <RelatorioTurnoScreen
        onVoltar={() => setActiveScreen('home')}
        onBack={() => setActiveScreen('home')}
      />
    );
  }

  if (activeScreen === 'matriz-isolamento') {
    return <MatrizIsolamentoScreen onBack={() => setActiveScreen('home')} />;
  }

  if (activeScreen === 'weather') {
    return <WeatherScreen onBack={() => setActiveScreen('home')} />;
  }

  return (
    <HomeScreen
      onOpenRelatorioTurno={() => setActiveScreen('relatorio-turno')}
      onOpenMatrizIsolamento={() => setActiveScreen('matriz-isolamento')}
      onOpenWeather={() => setActiveScreen('weather')}
    />
  );
}
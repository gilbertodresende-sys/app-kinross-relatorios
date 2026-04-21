import React, { useState } from 'react';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import WeatherScreen from './src/screens/WeatherScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('home');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (activeScreen === 'weather') {
    return <WeatherScreen onBack={() => setActiveScreen('home')} />;
  }

  return <HomeScreen onOpenWeather={() => setActiveScreen('weather')} />;
}
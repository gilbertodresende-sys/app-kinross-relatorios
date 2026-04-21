import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import ModuleCard from '../components/ModuleCard';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';

export default function HomeScreen({ onOpenWeather }) {
  const modules = [
    {
      title: 'Previsão do Tempo',
      subtitle: 'Consultar cidade e data',
      status: 'Disponível agora',
      action: onOpenWeather,
      primary: true,
    },
    {
      title: 'Relatório de Turno',
      subtitle: 'Em breve',
      status: 'Próximo módulo',
      disabled: true,
    },
    {
      title: 'Falhas e Pendências',
      subtitle: 'Em breve',
      status: 'Próximo módulo',
      disabled: true,
    },
  ];

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" />

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>TURNOAPP</Text>
        <Text style={styles.heroTitle}>Central de aplicativos do turno</Text>
        <Text style={styles.heroText}>
          Selecione abaixo a ferramenta que deseja abrir. Esta tela será o ponto
          de entrada dos próximos apps que vamos criar.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Aplicativos</Text>

      {modules.map((module) => (
        <ModuleCard
          key={module.title}
          title={module.title}
          subtitle={module.subtitle}
          status={module.status}
          onPress={module.action}
          disabled={module.disabled}
          primary={module.primary}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.navy,
    borderRadius: 20,
    padding: 20,
  },
  heroEyebrow: {
    color: colors.goldLight,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroText: {
    color: '#D7E0E8',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
});
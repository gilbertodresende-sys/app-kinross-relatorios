import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ onOpenWeather, onOpenMatrizIsolamento }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>App Operacional</Text>
          <Text style={styles.subtitle}>
            Selecione uma funcionalidade disponível.
          </Text>
        </View>

        <Pressable style={styles.card} onPress={onOpenWeather}>
          <Text style={styles.cardTitle}>Previsão do Tempo</Text>
          <Text style={styles.cardDescription}>
            Consultar condições climáticas e previsão para apoio operacional.
          </Text>
        </Pressable>

        <Pressable style={styles.card} onPress={onOpenMatrizIsolamento}>
          <Text style={styles.cardTitle}>Matriz de Isolamento</Text>
          <Text style={styles.cardDescription}>
            Consultar fontes de energia, pontos de bloqueio, forma de isolamento e PDF oficial da matriz.
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F3B63',
  },
  subtitle: {
    fontSize: 15,
    color: '#5B6773',
    marginTop: 6,
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D9E1E8',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F3B63',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#5B6773',
    lineHeight: 21,
    fontSize: 14,
  },
});
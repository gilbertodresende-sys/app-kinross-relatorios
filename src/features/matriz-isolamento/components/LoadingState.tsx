import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { matrizTheme } from '../utils/theme';

export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={matrizTheme.colors.primary} />
      <Text style={styles.text}>Carregando matrizes...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: matrizTheme.colors.textSecondary,
  },
});
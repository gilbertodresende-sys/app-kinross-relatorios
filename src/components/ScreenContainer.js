import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function ScreenContainer({ children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    gap: 16,
  },
});
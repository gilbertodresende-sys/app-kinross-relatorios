import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { matrizTheme } from '../utils/theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: matrizTheme.colors.card,
    borderRadius: matrizTheme.radius.lg,
    padding: matrizTheme.spacing.lg,
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
  },
  title: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 8,
    color: matrizTheme.colors.primary,
  },
  description: {
    color: matrizTheme.colors.textSecondary,
    lineHeight: 22,
  },
});
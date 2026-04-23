import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { matrizTheme } from '../utils/theme';

interface PdfActionsCardProps {
  onOpenPdf: () => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  syncMessage?: string;
}

export function PdfActionsCard({
  onOpenPdf,
  onRefresh,
  isRefreshing,
  syncMessage,
}: PdfActionsCardProps) {
  async function handleOpenPdf() {
    try {
      await onOpenPdf();
    } catch (error) {
      Alert.alert('PDF', error instanceof Error ? error.message : 'Falha ao abrir o PDF.');
    }
  }

  async function handleRefresh() {
    try {
      await onRefresh();
    } catch (error) {
      Alert.alert('Atualização', error instanceof Error ? error.message : 'Falha ao atualizar.');
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ações</Text>

      <Pressable style={styles.primaryButton} onPress={handleOpenPdf}>
        <Text style={styles.primaryButtonText}>Abrir PDF oficial</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleRefresh} disabled={isRefreshing}>
        <Text style={styles.secondaryButtonText}>
          {isRefreshing ? 'Atualizando...' : 'Atualizar matrizes'}
        </Text>
      </Pressable>

      {!!syncMessage && <Text style={styles.syncMessage}>{syncMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: matrizTheme.colors.card,
    borderRadius: matrizTheme.radius.lg,
    padding: matrizTheme.spacing.md,
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
    shadowColor: matrizTheme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: matrizTheme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: matrizTheme.colors.primary,
  },
  primaryButton: {
    backgroundColor: matrizTheme.colors.primary,
    borderRadius: matrizTheme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: matrizTheme.colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: matrizTheme.colors.primaryLight,
    borderRadius: matrizTheme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: matrizTheme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  syncMessage: {
    fontSize: 12,
    color: matrizTheme.colors.textSecondary,
    lineHeight: 18,
  },
});
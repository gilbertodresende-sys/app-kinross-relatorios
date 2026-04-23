import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MatrizItem } from '../types/matriz.types';
import { matrizTheme } from '../utils/theme';

interface IsolationResultCardProps {
  item: MatrizItem;
  revision?: string;
  updatedAt?: string;
  matrixName?: string;
}

function SectionList({
  title,
  values,
  tone = 'neutral',
}: {
  title: string;
  values: string[];
  tone?: 'neutral' | 'warning' | 'success';
}) {
  const toneStyle =
    tone === 'warning'
      ? styles.sectionWarning
      : tone === 'success'
      ? styles.sectionSuccess
      : styles.sectionNeutral;

  return (
    <View style={[styles.sectionBox, toneStyle]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {values.map((value, index) => (
        <View key={`${title}-${index}`} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

export function IsolationResultCard({
  item,
  revision,
  updatedAt,
  matrixName,
}: IsolationResultCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerBannerTitle}>Resultado da Matriz</Text>
        {!!matrixName && <Text style={styles.headerBannerSubtitle}>Matriz: {matrixName}</Text>}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Equipamento selecionado</Text>
        <Text style={styles.infoValue}>{item.equipment}</Text>
      </View>

      <SectionList title="Energias existentes" values={item.energies} tone="neutral" />
      <SectionList title="O que deverá ser isolado" values={item.isolationTargets} tone="warning" />
      <SectionList title="Como fazer o isolamento" values={item.procedures} tone="success" />

      {!!item.notes?.length && (
        <SectionList title="Observações" values={item.notes} tone="neutral" />
      )}

      <View style={styles.footer}>
        {!!revision && <Text style={styles.meta}>Revisão: {revision}</Text>}
        {!!updatedAt && <Text style={styles.meta}>Atualizado em: {updatedAt}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: matrizTheme.colors.card,
    borderRadius: matrizTheme.radius.lg,
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
    overflow: 'hidden',
    shadowColor: matrizTheme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerBanner: {
    backgroundColor: matrizTheme.colors.primary,
    paddingHorizontal: matrizTheme.spacing.md,
    paddingVertical: matrizTheme.spacing.md,
  },
  headerBannerTitle: {
    color: matrizTheme.colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  headerBannerSubtitle: {
    color: '#D7E6F4',
    marginTop: 4,
    fontSize: 13,
  },
  infoCard: {
    padding: matrizTheme.spacing.md,
    backgroundColor: '#F9FBFD',
    borderBottomWidth: 1,
    borderBottomColor: matrizTheme.colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: matrizTheme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: '700',
    color: matrizTheme.colors.text,
  },
  sectionBox: {
    marginHorizontal: matrizTheme.spacing.md,
    marginTop: matrizTheme.spacing.md,
    borderRadius: matrizTheme.radius.md,
    padding: matrizTheme.spacing.md,
    borderWidth: 1,
  },
  sectionNeutral: {
    backgroundColor: '#F8FBFE',
    borderColor: '#D9E7F3',
  },
  sectionWarning: {
    backgroundColor: matrizTheme.colors.warningBg,
    borderColor: '#F1D58A',
  },
  sectionSuccess: {
    backgroundColor: matrizTheme.colors.successBg,
    borderColor: '#BFE0C8',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: matrizTheme.colors.text,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 22,
    color: matrizTheme.colors.primary,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
    color: matrizTheme.colors.text,
  },
  footer: {
    marginTop: matrizTheme.spacing.md,
    padding: matrizTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: matrizTheme.colors.border,
    backgroundColor: '#FBFCFD',
  },
  meta: {
    color: matrizTheme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
});
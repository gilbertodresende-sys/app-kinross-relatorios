import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function ModuleCard({
  title,
  subtitle,
  status,
  onPress,
  disabled,
  primary,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        primary && styles.cardPrimary,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
    >
      <View style={styles.textArea}>
        <Text style={[styles.title, primary && styles.titlePrimary]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, primary && styles.subtitlePrimary]}>
          {subtitle}
        </Text>
      </View>

      <View style={[styles.statusPill, primary && styles.statusPillPrimary]}>
        <Text style={[styles.statusText, primary && styles.statusTextPrimary]}>
          {status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardPrimary: {
    borderColor: colors.gold,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  textArea: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  titlePrimary: {
    color: colors.navy,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  subtitlePrimary: {
    color: colors.navySoft,
  },
  statusPill: {
    backgroundColor: '#EEF2F5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillPrimary: {
    backgroundColor: '#FFF5D9',
  },
  statusText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPrimary: {
    color: '#8A6300',
  },
});
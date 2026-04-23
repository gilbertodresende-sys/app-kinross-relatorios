import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { OptionItem } from '../types/matriz.types';
import { matrizTheme } from '../utils/theme';

interface EquipmentSearchProps {
  query: string;
  selectedEquipment: string;
  options: OptionItem[];
  onQueryChange: (value: string) => void;
  onEquipmentChange: (value: string) => void;
}

export function EquipmentSearch({
  query,
  selectedEquipment,
  options,
  onQueryChange,
  onEquipmentChange,
}: EquipmentSearchProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Equipamento</Text>

      <Text style={styles.label}>Buscar equipamento</Text>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder="Digite código ou nome do equipamento"
        style={styles.input}
        autoCapitalize="characters"
        placeholderTextColor={matrizTheme.colors.textMuted}
      />

      <Text style={styles.label}>Selecionar equipamento</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedEquipment}
          onValueChange={(value) => onEquipmentChange(String(value))}
        >
          <Picker.Item label="Selecione o equipamento" value="" />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.helper}>
        Use a busca para localizar rapidamente o equipamento na matriz selecionada.
      </Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: matrizTheme.colors.primary,
    marginBottom: 4,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    color: matrizTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
    borderRadius: matrizTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFBFC',
    color: matrizTheme.colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
    borderRadius: matrizTheme.radius.md,
    overflow: 'hidden',
    backgroundColor: '#FAFBFC',
  },
  helper: {
    fontSize: 12,
    color: matrizTheme.colors.textSecondary,
    marginTop: 4,
  },
});
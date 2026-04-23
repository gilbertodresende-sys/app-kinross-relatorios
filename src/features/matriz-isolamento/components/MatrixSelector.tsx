import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { OptionItem, SupervisaoTipo } from '../types/matriz.types';
import { matrizTheme } from '../utils/theme';

interface MatrixSelectorProps {
  supervisao: SupervisaoTipo;
  matrixId?: string;
  options: OptionItem[];
  onChangeSupervisao: (value: SupervisaoTipo) => void;
  onChangeMatrix: (value: string) => void;
}

export function MatrixSelector({
  supervisao,
  matrixId,
  options,
  onChangeSupervisao,
  onChangeMatrix,
}: MatrixSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Seleção da Matriz</Text>

      <Text style={styles.label}>Supervisão</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={supervisao}
          onValueChange={(value) => onChangeSupervisao(value as SupervisaoTipo)}
        >
          <Picker.Item label="Elétrica" value="eletrica" />
          <Picker.Item label="Instrumentação" value="instrumentacao" />
        </Picker>
      </View>

      <Text style={styles.label}>Matriz</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={matrixId} onValueChange={(value) => onChangeMatrix(String(value))}>
          {options.length === 0 ? (
            <Picker.Item label="Nenhuma matriz disponível" value="" />
          ) : (
            options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))
          )}
        </Picker>
      </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: matrizTheme.colors.border,
    borderRadius: matrizTheme.radius.md,
    overflow: 'hidden',
    backgroundColor: '#FAFBFC',
  },
});
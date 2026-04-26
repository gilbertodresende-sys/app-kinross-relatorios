import React, { useCallback } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { EquipmentSearch } from '../components/EquipmentSearch';
import { IsolationResultCard } from '../components/IsolationResultCard';
import { LoadingState } from '../components/LoadingState';
import { MatrixSelector } from '../components/MatrixSelector';
import { PdfActionsCard } from '../components/PdfActionsCard';
import { useMatrizData } from '../hooks/useMatrizData';
import { useMatrizSync } from '../hooks/useMatrizSync';
import { matrizPdfService } from '../services/matrizPdfService';
import { matrizTheme } from '../utils/theme';

type MatrizIsolamentoScreenProps = {
  onBack?: () => void;
};

export default function MatrizIsolamentoScreen({
  onBack,
}: MatrizIsolamentoScreenProps) {
  const {
    isLoading,
    selectedSupervisao,
    setSelectedSupervisao,
    selectedMatrixId,
    setSelectedMatrixId,
    selectedEquipment,
    setSelectedEquipment,
    equipmentQuery,
    setEquipmentQuery,
    selectedMatrix,
    selectedItem,
    matrixOptions,
    equipmentOptions,
    clearSelection,
  } = useMatrizData();

  useMatrizSync();

  const handleOpenPdf = useCallback(async () => {
    if (!selectedMatrix) {
      throw new Error('Selecione uma matriz primeiro.');
    }

    await matrizPdfService.openPdf(selectedMatrix);
  }, [selectedMatrix]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBanner}>
          <View style={styles.topRow}>
            {!!onBack && (
              <Pressable style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>Voltar</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.headerTitle}>Matriz de Isolamento</Text>
          <Text style={styles.headerSubtitle}>
            Consulte a matriz oficial para validar fontes de energia, pontos de isolamento e a forma
            correta de executar o bloqueio.
          </Text>
        </View>

        <MatrixSelector
          supervisao={selectedSupervisao}
          matrixId={selectedMatrixId}
          options={matrixOptions}
          onChangeSupervisao={(value) => {
            setSelectedSupervisao(value);
            clearSelection();
          }}
          onChangeMatrix={setSelectedMatrixId}
        />

        {!selectedMatrixId ? (
          <EmptyState
            title="Nenhuma matriz disponível"
            description="Verifique se a base de dados foi gerada e se existe pelo menos uma matriz cadastrada para a supervisão selecionada."
          />
        ) : (
          <EquipmentSearch
            query={equipmentQuery}
            selectedEquipment={selectedEquipment}
            options={equipmentOptions}
            onQueryChange={setEquipmentQuery}
            onEquipmentChange={setSelectedEquipment}
          />
        )}

        {!selectedMatrix && selectedMatrixId ? (
          <EmptyState
            title="Matriz não encontrada"
            description="A matriz selecionada não foi localizada na base local."
          />
        ) : null}

        {!!selectedMatrix && !selectedItem && (
          <EmptyState
            title="Selecione o equipamento"
            description={
              equipmentOptions.length
                ? 'Escolha o equipamento onde será realizado o trabalho para visualizar a orientação de isolamento.'
                : 'Nenhum equipamento encontrado para essa busca.'
            }
          />
        )}

        {!!selectedItem && (
          <IsolationResultCard
            item={selectedItem}
            revision={selectedMatrix?.revision}
            updatedAt={selectedMatrix?.updatedAt}
            matrixName={selectedMatrix?.name}
          />
        )}

        <PdfActionsCard
          onOpenPdf={handleOpenPdf}
          showRefreshButton={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: matrizTheme.colors.background,
  },
  content: {
    padding: matrizTheme.spacing.md,
    gap: matrizTheme.spacing.md,
  },
  headerBanner: {
    backgroundColor: matrizTheme.colors.primary,
    borderRadius: matrizTheme.radius.xl,
    padding: matrizTheme.spacing.lg,
    shadowColor: matrizTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  topRow: {
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backButtonText: {
    color: matrizTheme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: matrizTheme.colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#D7E6F4',
    lineHeight: 21,
  },
});
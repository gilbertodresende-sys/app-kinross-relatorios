import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MatrizArquivo,
  MatrizCatalogoItem,
  MatrizItem,
  OptionItem,
  SupervisaoTipo,
} from '../types/matriz.types';
import { matrizRepository } from '../services/matrizRepository';
import { buildEquipmentOptions } from '../utils/buildEquipmentOptions';
import { filterEquipment } from '../utils/filterEquipment';

export function useMatrizData() {
  const [catalog, setCatalog] = useState<MatrizCatalogoItem[]>([]);
  const [selectedSupervisao, setSelectedSupervisao] = useState<SupervisaoTipo>('eletrica');
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [equipmentQuery, setEquipmentQuery] = useState<string>('');
  const [selectedMatrix, setSelectedMatrix] = useState<MatrizArquivo | null>(null);
  const [selectedItem, setSelectedItem] = useState<MatrizItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const catalogData = await matrizRepository.getCatalog();
      setCatalog(catalogData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const matrixOptions = useMemo<OptionItem[]>(() => {
    return catalog
      .filter((item) => item.supervisao === selectedSupervisao)
      .map((item) => ({
        label: `${item.code} (${item.equipmentCount} equipamentos)`,
        value: item.id,
      }));
  }, [catalog, selectedSupervisao]);

  useEffect(() => {
    if (!matrixOptions.length) {
      setSelectedMatrixId('');
      return;
    }

    const exists = matrixOptions.some((option) => option.value === selectedMatrixId);
    if (!exists) {
      setSelectedMatrixId(matrixOptions[0].value);
    }
  }, [matrixOptions, selectedMatrixId]);

  useEffect(() => {
    async function loadMatrix() {
      if (!selectedMatrixId) {
        setSelectedMatrix(null);
        setSelectedItem(null);
        return;
      }

      const matrix = await matrizRepository.getMatrixById(selectedMatrixId);
      setSelectedMatrix(matrix);
      setSelectedEquipment('');
      setEquipmentQuery('');
      setSelectedItem(null);
    }

    void loadMatrix();
  }, [selectedMatrixId]);

  const filteredItems = useMemo<MatrizItem[]>(() => {
    if (!selectedMatrix) return [];
    return filterEquipment(selectedMatrix.items, equipmentQuery);
  }, [selectedMatrix, equipmentQuery]);

  const equipmentOptions = useMemo<OptionItem[]>(() => {
    return buildEquipmentOptions(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    if (!selectedEquipment || !selectedMatrixId) {
      setSelectedItem(null);
      return;
    }

    void matrizRepository.findEquipment(selectedMatrixId, selectedEquipment).then(setSelectedItem);
  }, [selectedEquipment, selectedMatrixId]);

  const clearSelection = useCallback(() => {
    setEquipmentQuery('');
    setSelectedEquipment('');
    setSelectedItem(null);
  }, []);

  return {
    isLoading,
    catalog,
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
    filteredItems,
    clearSelection,
    reloadCatalog: loadCatalog,
  };
}
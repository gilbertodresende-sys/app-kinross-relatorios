import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CIDADES_BR from '../constants/cities';
import { fetchWeatherByCityAndDate } from '../services/weatherService';
import colors from '../theme/colors';
import { formatDate, isDateInsideForecastRange } from '../utils/date';

export default function WeatherScreen({ onBack }) {
  const [cidade, setCidade] = useState('Paracatu');
  const [data, setData] = useState(formatDate(new Date()));
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const cidadesOrdenadas = useMemo(() => {
    return [...CIDADES_BR].sort((a, b) => a.localeCompare(b));
  }, []);

  async function buscarPrevisao() {
    try {
      setCarregando(true);
      setResultado(null);
      setErro('');

      if (!cidade?.trim()) {
        setErro('Selecione ou digite uma cidade.');
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        setErro('Use o formato AAAA-MM-DD. Exemplo: 2026-04-21');
        return;
      }

      if (!isDateInsideForecastRange(data)) {
        setErro('Este app consulta a previsão entre hoje e os próximos 16 dias.');
        return;
      }

      const dataWeather = await fetchWeatherByCityAndDate(cidade, data);
      setResultado(dataWeather);
    } catch (error) {
      console.error('Erro ao buscar previsão:', error);

      if (error.message === 'CITY_NOT_FOUND') {
        setErro('Cidade não encontrada. Tente outra cidade brasileira.');
      } else if (error.message === 'NO_DATA') {
        setErro('Não foi possível obter a previsão para a data escolhida.');
      } else {
        setErro('Falha ao consultar a previsão do tempo.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>

        <Text style={styles.topBarTitle}>Previsão do Tempo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cidade do Brasil</Text>

        <TextInput
          value={cidade}
          onChangeText={setCidade}
          placeholder="Digite uma cidade"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />

        <View style={styles.chipsContainer}>
          {cidadesOrdenadas.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCidade(item)}
              style={[styles.chip, cidade === item && styles.chipAtivo]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  cidade === item && styles.chipTextoAtivo,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Data</Text>

        <TextInput
          value={data}
          onChangeText={setData}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />

        <Text style={styles.ajuda}>
          Use uma data entre hoje e os próximos 16 dias.
        </Text>

        <Pressable style={styles.botao} onPress={buscarPrevisao}>
          <Text style={styles.botaoTexto}>Buscar previsão</Text>
        </Pressable>

        {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}
      </View>

      {carregando && (
        <View style={styles.cardResultado}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.carregando}>Consultando dados...</Text>
        </View>
      )}

      {resultado && !carregando && (
        <View style={styles.cardResultado}>
          <Text style={styles.resultadoTitulo}>
            {resultado.cidadeEncontrada}
          </Text>

          <Text style={styles.resultadoData}>{resultado.data}</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Condição</Text>
            <Text style={styles.resultValue}>{resultado.descricaoTempo}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Temperatura máxima</Text>
            <Text style={styles.resultValue}>
              {resultado.temperaturaMax} °C
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Temperatura mínima</Text>
            <Text style={styles.resultValue}>
              {resultado.temperaturaMin} °C
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chance de chuva</Text>
            <Text style={styles.resultValue}>{resultado.chanceChuva}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Vento máximo</Text>
            <Text style={styles.resultValue}>{resultado.ventoMax} km/h</Text>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  backButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardResultado: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  ajuda: {
    fontSize: 12,
    color: colors.muted,
  },
  erroTexto: {
    marginTop: 10,
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipAtivo: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipTexto: {
    color: colors.text,
    fontWeight: '500',
  },
  chipTextoAtivo: {
    color: colors.white,
  },
  botao: {
    marginTop: 8,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoTexto: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  carregando: {
    textAlign: 'center',
    color: colors.muted,
  },
  resultadoTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  resultadoData: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  resultRow: {
    borderTopWidth: 1,
    borderTopColor: colors.resultBorder,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.muted,
  },
  resultValue: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
});
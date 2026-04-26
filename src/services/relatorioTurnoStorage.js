import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@relatorios_turno";

export async function listarRelatoriosTurno() {
  try {
    const dados = await AsyncStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error("Erro ao listar relatórios de turno:", error);
    return [];
  }
}

export async function salvarRelatorioTurno(relatorio) {
  try {
    const relatoriosAtuais = await listarRelatoriosTurno();

    const relatorioParaSalvar = {
      ...relatorio,
      id: relatorio.id || String(Date.now()),
      criadoEm: relatorio.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const jaExiste = relatoriosAtuais.some(
      (item) => item.id === relatorioParaSalvar.id
    );

    const novaLista = jaExiste
      ? relatoriosAtuais.map((item) =>
          item.id === relatorioParaSalvar.id ? relatorioParaSalvar : item
        )
      : [relatorioParaSalvar, ...relatoriosAtuais];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

    return relatorioParaSalvar;
  } catch (error) {
    console.error("Erro ao salvar relatório de turno:", error);
    throw error;
  }
}

export async function excluirRelatorioTurno(id) {
  try {
    const relatoriosAtuais = await listarRelatoriosTurno();
    const novaLista = relatoriosAtuais.filter((item) => item.id !== id);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
  } catch (error) {
    console.error("Erro ao excluir relatório de turno:", error);
    throw error;
  }
}
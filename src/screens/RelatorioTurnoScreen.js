import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';

import {
  excluirRelatorioTurno,
  listarRelatoriosTurno,
  salvarRelatorioTurno,
} from '../services/relatorioTurnoStorage';

import TAGS_P2 from '../data/tagsP2';

const opcoesTurno = [
  'Diurno A',
  'Diurno B',
  'Diurno C',
  'Diurno D',
  'Noturno A',
  'Noturno B',
  'Noturno C',
  'Noturno D',
];

const opcoesStatus = [
  'Em falha',
  'Solucionado com Pendência',
  'Solucionado',
];

const modeloOcorrencia = {
  equipamento: '',
  equipamentoDescritivo: '',
  descricao: '',
  acaoRealizada: '',
  pendencia: '',
  responsavel: '',
  status: 'Em falha',
  fotos: [],
};

function criarRelatorioVazio() {
  return {
    id: null,
    data: new Date().toLocaleDateString('pt-BR'),
    turno: '',
    area: 'P2',
    equipe: '',
    supervisor: '',
    resumoTurno: '',
    seguranca: '',
    indisponibilidade: 'Não',
    ocorrencias: [{ ...modeloOcorrencia }],
  };
}

function escaparHtml(texto) {
  return String(texto || '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function RelatorioTurnoScreen({ onVoltar, onBack }) {
  const voltar = onVoltar || onBack;

  const [aba, setAba] = useState('novo');
  const [relatorios, setRelatorios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [relatorio, setRelatorio] = useState(criarRelatorioVazio());
  const [indiceAutocompleteAberto, setIndiceAutocompleteAberto] = useState(null);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  async function carregarRelatorios() {
    const lista = await listarRelatoriosTurno();
    setRelatorios(lista);
  }

  function atualizarCampo(campo, valor) {
    setRelatorio((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function atualizarOcorrencia(index, campo, valor) {
    setRelatorio((atual) => {
      const novaLista = atual.ocorrencias.map((ocorrencia, i) => {
        if (i !== index) return ocorrencia;

        return {
          ...ocorrencia,
          [campo]: valor,
        };
      });

      return {
        ...atual,
        ocorrencias: novaLista,
      };
    });
  }

  function atualizarEquipamentoDigitado(index, valor) {
    setRelatorio((atual) => {
      const novaLista = atual.ocorrencias.map((ocorrencia, i) => {
        if (i !== index) return ocorrencia;

        return {
          ...ocorrencia,
          equipamento: valor,
          equipamentoDescritivo: '',
        };
      });

      return {
        ...atual,
        ocorrencias: novaLista,
      };
    });

    setIndiceAutocompleteAberto(index);
  }

  function selecionarEquipamento(index, item) {
    setRelatorio((atual) => {
      const novaLista = atual.ocorrencias.map((ocorrencia, i) => {
        if (i !== index) return ocorrencia;

        return {
          ...ocorrencia,
          equipamento: item.tag,
          equipamentoDescritivo: item.descritivo,
        };
      });

      return {
        ...atual,
        ocorrencias: novaLista,
      };
    });

    setIndiceAutocompleteAberto(null);
  }

  function adicionarOcorrencia() {
    setRelatorio((atual) => ({
      ...atual,
      ocorrencias: [...atual.ocorrencias, { ...modeloOcorrencia }],
    }));
  }

  function removerOcorrencia(index) {
    if (relatorio.ocorrencias.length === 1) {
      Alert.alert('Atenção', 'O relatório precisa ter pelo menos uma ocorrência.');
      return;
    }

    const novaLista = relatorio.ocorrencias.filter((_, i) => i !== index);

    setRelatorio((atual) => ({
      ...atual,
      ocorrencias: novaLista,
    }));
  }

  async function adicionarFoto(index) {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso às fotos para anexar imagens à ocorrência.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (resultado.canceled) return;

      const novasFotos = resultado.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName || `foto_ocorrencia_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      }));

      setRelatorio((atual) => {
        const novaLista = atual.ocorrencias.map((ocorrencia, i) => {
          if (i !== index) return ocorrencia;

          return {
            ...ocorrencia,
            fotos: [...(ocorrencia.fotos || []), ...novasFotos],
          };
        });

        return {
          ...atual,
          ocorrencias: novaLista,
        };
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível anexar a foto.');
    }
  }

  function removerFoto(indexOcorrencia, indexFoto) {
    setRelatorio((atual) => {
      const novaLista = atual.ocorrencias.map((ocorrencia, i) => {
        if (i !== indexOcorrencia) return ocorrencia;

        return {
          ...ocorrencia,
          fotos: (ocorrencia.fotos || []).filter((_, fotoIndex) => fotoIndex !== indexFoto),
        };
      });

      return {
        ...atual,
        ocorrencias: novaLista,
      };
    });
  }

  async function salvar() {
    if (!relatorio.data || !relatorio.turno || !relatorio.supervisor) {
      Alert.alert(
        'Campos obrigatórios',
        'Informe pelo menos data, turno e supervisor.'
      );
      return;
    }

    try {
      const salvo = await salvarRelatorioTurno(relatorio);
      setRelatorio(salvo);
      await carregarRelatorios();

      Alert.alert('Sucesso', 'Relatório de turno salvo com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o relatório.');
    }
  }

  function novoRelatorio() {
    setRelatorio(criarRelatorioVazio());
    setIndiceAutocompleteAberto(null);
    setAba('novo');
  }

  function montarTextoEmail(item = relatorio) {
    const ocorrenciasTexto = item.ocorrencias
      .map(
        (ocorrencia, index) => `
${index + 1}. Equipamento: ${ocorrencia.equipamento || '-'}
Descritivo: ${ocorrencia.equipamentoDescritivo || '-'}
Descrição: ${ocorrencia.descricao || '-'}
Ação realizada: ${ocorrencia.acaoRealizada || '-'}
Pendência: ${ocorrencia.pendencia || '-'}
Responsável: ${ocorrencia.responsavel || '-'}
Status: ${ocorrencia.status || '-'}
Fotos anexadas ao e-mail: ${(ocorrencia.fotos || []).length}
`
      )
      .join('\n');

    return `
INDISPONIBILIDADE: ${item.indisponibilidade || 'Não'}

RELATÓRIO DE TURNO - MANUTENÇÃO ELÉTRICA E INSTRUMENTAÇÃO

Data: ${item.data || '-'}
Turno: ${item.turno || '-'}
Área: ${item.area || '-'}
Equipe: ${item.equipe || '-'}
Supervisor: ${item.supervisor || '-'}

OCORRÊNCIAS
${ocorrenciasTexto}

ROTINAS DO TURNO
${item.resumoTurno || '-'}

ORIENTAÇÕES
${item.seguranca || '-'}

Relatório gerado pelo App Kinross.
`;
  }

  function montarHtmlEmail(item = relatorio) {
    const indisponibilidade = item.indisponibilidade || 'Não';

    const destaqueIndisponibilidade =
      indisponibilidade === 'Sim'
        ? 'color: #B91C1C; font-size: 28px; font-weight: 900;'
        : 'color: #111827; font-size: 22px; font-weight: 900;';

    const ocorrenciasHtml = item.ocorrencias
      .map((ocorrencia, index) => {
        return `
          <div style="border: 1px solid #D1D5DB; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0;">Ocorrência ${index + 1}</h3>
            <p><strong>Equipamento:</strong> ${escaparHtml(ocorrencia.equipamento)}</p>
            <p><strong>Descritivo:</strong> ${escaparHtml(ocorrencia.equipamentoDescritivo)}</p>
            <p><strong>Descrição:</strong> ${escaparHtml(ocorrencia.descricao)}</p>
            <p><strong>Ação realizada:</strong> ${escaparHtml(ocorrencia.acaoRealizada)}</p>
            <p><strong>Pendência:</strong> ${escaparHtml(ocorrencia.pendencia)}</p>
            <p><strong>Responsável:</strong> ${escaparHtml(ocorrencia.responsavel)}</p>
            <p><strong>Status:</strong> ${escaparHtml(ocorrencia.status)}</p>
            <p><strong>Fotos anexadas ao e-mail:</strong> ${(ocorrencia.fotos || []).length}</p>
          </div>
        `;
      })
      .join('');

    return `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="${destaqueIndisponibilidade}">
          INDISPONIBILIDADE: ${escaparHtml(indisponibilidade)}
        </div>

        <h2>RELATÓRIO DE TURNO - MANUTENÇÃO ELÉTRICA E INSTRUMENTAÇÃO</h2>

        <p><strong>Data:</strong> ${escaparHtml(item.data)}</p>
        <p><strong>Turno:</strong> ${escaparHtml(item.turno)}</p>
        <p><strong>Área:</strong> ${escaparHtml(item.area)}</p>
        <p><strong>Equipe:</strong> ${escaparHtml(item.equipe)}</p>
        <p><strong>Supervisor:</strong> ${escaparHtml(item.supervisor)}</p>

        <h3>OCORRÊNCIAS</h3>
        ${ocorrenciasHtml}

        <h3>ROTINAS DO TURNO</h3>
        <p>${escaparHtml(item.resumoTurno).replace(/\n/g, '<br />')}</p>

        <h3>ORIENTAÇÕES</h3>
        <p>${escaparHtml(item.seguranca).replace(/\n/g, '<br />')}</p>

        <p>Relatório gerado pelo App Kinross.</p>
      </div>
    `;
  }

  async function enviarEmail(item = relatorio) {
    const assunto = `Relatório de Turno - ${item.area || 'Área'} - ${
      item.data || ''
    } - ${item.turno || ''}`;

    const corpoTexto = montarTextoEmail(item);
    const corpoHtml = montarHtmlEmail(item);

    const anexos = item.ocorrencias
      .flatMap((ocorrencia) => ocorrencia.fotos || [])
      .map((foto) => foto.uri)
      .filter(Boolean);

    try {
      const disponivel = await MailComposer.isAvailableAsync();

      if (Platform.OS === 'web') {
        if (anexos.length > 0) {
          Alert.alert(
            'Atenção',
            'No navegador, o e-mail será aberto sem anexar as fotos automaticamente. Para enviar as fotos como anexo, use o app no celular.'
          );
        }

        const mailto = `mailto:?subject=${encodeURIComponent(
          assunto
        ).replace(/\+/g, '%20')}&body=${encodeURIComponent(corpoTexto).replace(
          /\+/g,
          '%20'
        )}`;

        window.location.href = mailto;
        return;
      }

      if (disponivel) {
        await MailComposer.composeAsync({
          subject: assunto,
          body: corpoHtml,
          isHtml: true,
          recipients: [],
          attachments: anexos,
        });
        return;
      }

      Alert.alert(
        'E-mail indisponível',
        'Não foi encontrado aplicativo de e-mail configurado neste dispositivo.'
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o envio de e-mail.');
    }
  }

  function abrirRelatorioAntigo(item) {
    setRelatorio({
      ...criarRelatorioVazio(),
      ...item,
      indisponibilidade: item.indisponibilidade || 'Não',
      ocorrencias: (item.ocorrencias || []).map((ocorrencia) => ({
        ...modeloOcorrencia,
        ...ocorrencia,
        fotos: ocorrencia.fotos || [],
      })),
    });

    setIndiceAutocompleteAberto(null);
    setAba('novo');
  }

  async function confirmarExclusao(id) {
    Alert.alert('Excluir relatório', 'Deseja realmente excluir este relatório?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirRelatorioTurno(id);
            await carregarRelatorios();

            if (relatorio.id === id) {
              setRelatorio(criarRelatorioVazio());
            }
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o relatório.');
          }
        },
      },
    ]);
  }

  const relatoriosFiltrados = useMemo(() => {
    const texto = normalizarTexto(filtro);

    return relatorios.filter((item) => {
      const base = normalizarTexto(`
        ${item.data}
        ${item.turno}
        ${item.area}
        ${item.supervisor}
        ${item.equipe}
        ${item.resumoTurno}
        ${item.indisponibilidade}
      `);

      return base.includes(texto);
    });
  }, [filtro, relatorios]);

  function buscarTags(texto) {
    const termo = normalizarTexto(texto);

    if (termo.length < 1) return [];

    return TAGS_P2.filter((item) => {
      const tag = normalizarTexto(item.tag);
      const descritivo = normalizarTexto(item.descritivo);
      const busca = normalizarTexto(item.busca);

      return (
        tag.includes(termo) ||
        descritivo.includes(termo) ||
        busca.includes(termo)
      );
    }).slice(0, 10);
  }

  function renderOpcoesTurno() {
    return (
      <View style={styles.chipsContainer}>
        {opcoesTurno.map((opcao) => (
          <Pressable
            key={opcao}
            style={[
              styles.chip,
              relatorio.turno === opcao && styles.chipSelecionado,
            ]}
            onPress={() => atualizarCampo('turno', opcao)}
          >
            <Text
              style={[
                styles.chipTexto,
                relatorio.turno === opcao && styles.chipTextoSelecionado,
              ]}
            >
              {opcao}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderOpcoesStatus(index, statusAtual) {
    return (
      <View style={styles.chipsContainer}>
        {opcoesStatus.map((opcao) => (
          <Pressable
            key={opcao}
            style={[
              styles.chip,
              statusAtual === opcao && styles.chipSelecionado,
            ]}
            onPress={() => atualizarOcorrencia(index, 'status', opcao)}
          >
            <Text
              style={[
                styles.chipTexto,
                statusAtual === opcao && styles.chipTextoSelecionado,
              ]}
            >
              {opcao}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderIndisponibilidade() {
    return (
      <View style={styles.indisponibilidadeBox}>
        <Text style={styles.subtitulo}>Indisponibilidade</Text>
        <Text style={styles.cardDescription}>
          Informe se houve indisponibilidade de equipamento/planta durante o turno.
        </Text>

        <View style={styles.chipsContainer}>
          {['Não', 'Sim'].map((opcao) => (
            <Pressable
              key={opcao}
              style={[
                styles.chip,
                relatorio.indisponibilidade === opcao && styles.chipSelecionado,
                opcao === 'Sim' &&
                  relatorio.indisponibilidade === 'Sim' &&
                  styles.chipVermelho,
              ]}
              onPress={() => atualizarCampo('indisponibilidade', opcao)}
            >
              <Text
                style={[
                  styles.chipTexto,
                  relatorio.indisponibilidade === opcao &&
                    styles.chipTextoSelecionado,
                ]}
              >
                {opcao}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Relatório do Turno</Text>

      {voltar && (
        <Pressable style={styles.botaoVoltar} onPress={voltar}>
          <Text style={styles.textoBotaoVoltar}>Voltar ao menu</Text>
        </Pressable>
      )}

      <View style={styles.abas}>
        <Pressable
          style={[styles.aba, aba === 'novo' && styles.abaAtiva]}
          onPress={() => setAba('novo')}
        >
          <Text style={[styles.textoAba, aba === 'novo' && styles.textoAbaAtiva]}>
            Elaborar
          </Text>
        </Pressable>

        <Pressable
          style={[styles.aba, aba === 'historico' && styles.abaAtiva]}
          onPress={() => {
            carregarRelatorios();
            setAba('historico');
          }}
        >
          <Text
            style={[
              styles.textoAba,
              aba === 'historico' && styles.textoAbaAtiva,
            ]}
          >
            Consultar
          </Text>
        </Pressable>
      </View>

      {aba === 'novo' ? (
        <ScrollView contentContainerStyle={styles.conteudo}>
          {relatorio.indisponibilidade === 'Sim' && (
            <View style={styles.alertaIndisponibilidade}>
              <Text style={styles.alertaIndisponibilidadeTexto}>
                INDISPONIBILIDADE: SIM
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.subtitulo}>Dados do turno</Text>

            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              value={relatorio.data}
              onChangeText={(valor) => atualizarCampo('data', valor)}
              placeholder="Ex.: 26/04/2026"
            />

            <Text style={styles.label}>Turno</Text>
            {renderOpcoesTurno()}

            <Text style={styles.label}>Área</Text>
            <TextInput
              style={styles.input}
              value={relatorio.area}
              onChangeText={(valor) => atualizarCampo('area', valor)}
              placeholder="Ex.: P2"
            />

            <Text style={styles.label}>Equipe</Text>
            <TextInput
              style={styles.input}
              value={relatorio.equipe}
              onChangeText={(valor) => atualizarCampo('equipe', valor)}
              placeholder="Nome dos integrantes da equipe"
            />

            <Text style={styles.label}>Supervisor</Text>
            <TextInput
              style={styles.input}
              value={relatorio.supervisor}
              onChangeText={(valor) => atualizarCampo('supervisor', valor)}
              placeholder="Nome do supervisor"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitulo}>Ocorrências</Text>

            {relatorio.ocorrencias.map((ocorrencia, index) => {
              const sugestoes = buscarTags(ocorrencia.equipamento);

              return (
                <View key={index} style={styles.ocorrencia}>
                  <Text style={styles.ocorrenciaTitulo}>
                    Ocorrência {index + 1}
                  </Text>

                  <Text style={styles.label}>Equipamento / TAG</Text>
                  <TextInput
                    style={styles.input}
                    value={ocorrencia.equipamento}
                    onFocus={() => setIndiceAutocompleteAberto(index)}
                    onChangeText={(valor) => atualizarEquipamentoDigitado(index, valor)}
                    placeholder="Digite o TAG ou parte do descritivo..."
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  {!!ocorrencia.equipamentoDescritivo && (
                    <Text style={styles.descritivoEquipamento}>
                      {ocorrencia.equipamentoDescritivo}
                    </Text>
                  )}

                  {indiceAutocompleteAberto === index && sugestoes.length > 0 && (
                    <View style={styles.autocompleteBox}>
                      {sugestoes.map((item) => (
                        <Pressable
                          key={`${item.tag}-${item.descritivo}`}
                          style={styles.autocompleteItem}
                          onPress={() => selecionarEquipamento(index, item)}
                        >
                          <Text style={styles.autocompleteTag}>{item.tag}</Text>
                          <Text style={styles.autocompleteDescricao}>
                            {item.descritivo || 'Sem descritivo'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <Text style={styles.label}>Descrição da falha / atividade</Text>
                  <TextInput
                    style={styles.textArea}
                    value={ocorrencia.descricao}
                    onChangeText={(valor) =>
                      atualizarOcorrencia(index, 'descricao', valor)
                    }
                    placeholder="Descreva o que aconteceu..."
                    multiline
                  />

                  <Text style={styles.label}>Ação realizada</Text>
                  <TextInput
                    style={styles.textArea}
                    value={ocorrencia.acaoRealizada}
                    onChangeText={(valor) =>
                      atualizarOcorrencia(index, 'acaoRealizada', valor)
                    }
                    placeholder="Descreva o que foi feito..."
                    multiline
                  />

                  <Text style={styles.label}>Pendência para o próximo turno</Text>
                  <TextInput
                    style={styles.textArea}
                    value={ocorrencia.pendencia}
                    onChangeText={(valor) =>
                      atualizarOcorrencia(index, 'pendencia', valor)
                    }
                    placeholder="Informe pendências, peças, apoio necessário ou acompanhamento..."
                    multiline
                  />

                  <Text style={styles.label}>Responsável</Text>
                  <TextInput
                    style={styles.input}
                    value={ocorrencia.responsavel}
                    onChangeText={(valor) =>
                      atualizarOcorrencia(index, 'responsavel', valor)
                    }
                    placeholder="Responsável pela tratativa"
                  />

                  <Text style={styles.label}>Status</Text>
                  {renderOpcoesStatus(index, ocorrencia.status)}

                  <Text style={styles.label}>Fotos</Text>
                  <Pressable
                    style={styles.botaoSecundario}
                    onPress={() => adicionarFoto(index)}
                  >
                    <Text style={styles.textoBotaoSecundario}>
                      + Inserir fotos
                    </Text>
                  </Pressable>

                  {(ocorrencia.fotos || []).length > 0 && (
                    <View style={styles.fotosContainer}>
                      {ocorrencia.fotos.map((foto, fotoIndex) => (
                        <View key={`${foto.uri}-${fotoIndex}`} style={styles.fotoItem}>
                          <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
                          <Pressable
                            style={styles.botaoRemoverFoto}
                            onPress={() => removerFoto(index, fotoIndex)}
                          >
                            <Text style={styles.textoBotaoRemoverFoto}>Remover</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <Pressable
                    style={styles.botaoExcluir}
                    onPress={() => removerOcorrencia(index)}
                  >
                    <Text style={styles.textoBotaoExcluir}>
                      Remover ocorrência
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <Pressable style={styles.botaoSecundario} onPress={adicionarOcorrencia}>
              <Text style={styles.textoBotaoSecundario}>
                + Adicionar ocorrência
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitulo}>Rotinas do Turno</Text>

            <TextInput
              style={styles.textArea}
              value={relatorio.resumoTurno}
              onChangeText={(valor) => atualizarCampo('resumoTurno', valor)}
              placeholder="Registre as rotinas executadas durante o turno..."
              multiline
            />

            <Text style={styles.subtitulo}>Orientações</Text>

            <TextInput
              style={styles.textArea}
              value={relatorio.seguranca}
              onChangeText={(valor) => atualizarCampo('seguranca', valor)}
              placeholder="Registre orientações, pontos de atenção, recomendações ou informações importantes para o próximo turno..."
              multiline
            />
          </View>

          <View style={styles.card}>{renderIndisponibilidade()}</View>

          <View style={styles.botoes}>
            <Pressable style={styles.botaoPrimario} onPress={salvar}>
              <Text style={styles.textoBotaoPrimario}>Salvar relatório</Text>
            </Pressable>

            <Pressable style={styles.botaoEmail} onPress={() => enviarEmail()}>
              <Text style={styles.textoBotaoPrimario}>Enviar por e-mail</Text>
            </Pressable>

            <Pressable style={styles.botaoLimpar} onPress={novoRelatorio}>
              <Text style={styles.textoBotaoLimpar}>Novo relatório</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.conteudoHistorico}>
          <TextInput
            style={styles.input}
            value={filtro}
            onChangeText={setFiltro}
            placeholder="Buscar por data, turno, supervisor, área..."
          />

          <FlatList
            data={relatoriosFiltrados}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Nenhum relatório encontrado.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.itemHistorico}>
                <Text style={styles.itemTitulo}>
                  {item.data} - {item.turno || 'Turno não informado'}
                </Text>

                <Text style={styles.itemTexto}>Área: {item.area || '-'}</Text>

                <Text style={styles.itemTexto}>
                  Supervisor: {item.supervisor || '-'}
                </Text>

                <Text style={styles.itemTexto}>
                  Indisponibilidade: {item.indisponibilidade || 'Não'}
                </Text>

                <Text style={styles.itemTexto} numberOfLines={2}>
                  Rotinas do Turno: {item.resumoTurno || '-'}
                </Text>

                <View style={styles.linhaBotoesHistorico}>
                  <Pressable
                    style={styles.botaoPequeno}
                    onPress={() => abrirRelatorioAntigo(item)}
                  >
                    <Text style={styles.textoBotaoPequeno}>Abrir</Text>
                  </Pressable>

                  <Pressable
                    style={styles.botaoPequenoEmail}
                    onPress={() => enviarEmail(item)}
                  >
                    <Text style={styles.textoBotaoPequeno}>E-mail</Text>
                  </Pressable>

                  <Pressable
                    style={styles.botaoPequenoExcluir}
                    onPress={() => confirmarExclusao(item.id)}
                  >
                    <Text style={styles.textoBotaoPequeno}>Excluir</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F9',
    paddingTop: 48,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F3B63',
    textAlign: 'center',
    marginBottom: 12,
  },
  botaoVoltar: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textoBotaoVoltar: {
    color: '#374151',
    fontWeight: '700',
  },
  abas: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#B88917',
  },
  textoAba: {
    fontWeight: '600',
    color: '#374151',
  },
  textoAbaAtiva: {
    color: '#FFFFFF',
  },
  conteudo: {
    padding: 16,
    paddingBottom: 40,
  },
  conteudoHistorico: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D9E1E8',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F3B63',
    marginBottom: 12,
  },
  cardDescription: {
    color: '#5B6773',
    lineHeight: 21,
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipSelecionado: {
    backgroundColor: '#B88917',
    borderColor: '#B88917',
  },
  chipVermelho: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  chipTexto: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextoSelecionado: {
    color: '#FFFFFF',
  },
  ocorrencia: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  ocorrenciaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  descritivoEquipamento: {
    color: '#0F3B63',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  autocompleteBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginTop: -4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  autocompleteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  autocompleteTag: {
    fontWeight: '800',
    color: '#0F3B63',
    marginBottom: 2,
  },
  autocompleteDescricao: {
    color: '#5B6773',
    fontSize: 13,
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  fotoItem: {
    width: 100,
  },
  fotoPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  botaoRemoverFoto: {
    marginTop: 4,
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  textoBotaoRemoverFoto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  indisponibilidadeBox: {
    marginTop: 4,
  },
  alertaIndisponibilidade: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertaIndisponibilidadeTexto: {
    color: '#B91C1C',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  botoes: {
    gap: 10,
  },
  botaoPrimario: {
    backgroundColor: '#B88917',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoEmail: {
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#B88917',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  botaoLimpar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoExcluir: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoBotaoPrimario: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  textoBotaoSecundario: {
    color: '#B88917',
    fontSize: 15,
    fontWeight: '700',
  },
  textoBotaoLimpar: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
  },
  textoBotaoExcluir: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  itemHistorico: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  itemTexto: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 3,
  },
  linhaBotoesHistorico: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  botaoPequeno: {
    flex: 1,
    backgroundColor: '#B88917',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoPequenoEmail: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoPequenoExcluir: {
    flex: 1,
    backgroundColor: '#B91C1C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoPequeno: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textoVazio: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
  },
});
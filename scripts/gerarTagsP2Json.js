const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const arquivoEntrada = path.join(__dirname, '..', 'assets', 'data', 'TAGs_P2.xlsx');
const arquivoSaida = path.join(__dirname, '..', 'src', 'data', 'tagsP2.js');

function limparTexto(valor) {
  if (valor === undefined || valor === null) return '';
  return String(valor).trim();
}

function gerarTags() {
  if (!fs.existsSync(arquivoEntrada)) {
    console.error('Arquivo TAGs_P2.xlsx não encontrado em assets/data/TAGs_P2.xlsx');
    process.exit(1);
  }

  const workbook = XLSX.readFile(arquivoEntrada);
  const primeiraAba = workbook.SheetNames[0];
  const sheet = workbook.Sheets[primeiraAba];

  const linhas = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });

  const tags = [];

  linhas.forEach((linha) => {
    const tag = limparTexto(linha[0]);
    const descritivo = limparTexto(linha[2]);

    if (!tag) return;

    const tagMinusculo = tag.toLowerCase();

    if (
      tagMinusculo.includes('tag') ||
      tagMinusculo.includes('equipamento') ||
      tagMinusculo.includes('identificação')
    ) {
      return;
    }

    tags.push({
      tag,
      descritivo,
      busca: `${tag} ${descritivo}`.toLowerCase(),
    });
  });

  const conteudo = `const TAGS_P2 = ${JSON.stringify(tags, null, 2)};

export default TAGS_P2;
`;

  fs.mkdirSync(path.dirname(arquivoSaida), { recursive: true });
  fs.writeFileSync(arquivoSaida, conteudo, 'utf8');

  console.log(`Arquivo gerado com sucesso: src/data/tagsP2.js`);
  console.log(`Total de TAGs importadas: ${tags.length}`);
}

gerarTags();
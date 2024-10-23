// extrairCNPJ.js

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função principal
(async () => {
  try {
    const cnpj = '24.276.421/0001-08'; // Substitua pelo CNPJ desejado
    const cnpjSemPontuacao = cnpj.replace(/[^\d]/g, '');

    // Inicializa o navegador
    const browser = await iniciarNavegador();
    const page = await browser.newPage();

    // Navega para a página e realiza a consulta
    await navegarParaPaginaConsulta(page, cnpj);

    // Aguarda a navegação após a validação manual do reCAPTCHA
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Extrai os dados da página
    const dadosExtraidos = await extrairDadosDaPagina(page);

    // Verifica se os dados foram extraídos com sucesso
    if (Object.keys(dadosExtraidos).length === 0) {
      console.error(
        'Não foi possível extrair os dados. Verifique se a página está correta.'
      );
    } else {
      // Salva os dados em um arquivo JSON
      salvarDadosEmJSON(dadosExtraidos, cnpjSemPontuacao);
    }

    // Fecha o navegador
    await browser.close();
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
})();

// Função para iniciar o navegador
async function iniciarNavegador() {
  return await puppeteer.launch({
    headless: false,
    userDataDir: './user_data',
    defaultViewport: null,
    args: ['--start-maximized'],
  });
}

// Função para navegar para a página de consulta e preencher o CNPJ
async function navegarParaPaginaConsulta(page, cnpj) {
  const url =
    'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp';
  console.log(`Abrindo o navegador para consultar o CNPJ: ${cnpj}...`);

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  );
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  await page.goto(url);
  await page.type('#cnpj', cnpj);

  console.log('Complete o reCAPTCHA manualmente e clique em Consultar.');
}

// Função para extrair os dados da página
async function extrairDadosDaPagina(page) {
  return await page.evaluate(() => {
    // Define os rótulos que queremos extrair
    const labelsToExtract = [
      'NÚMERO DE INSCRIÇÃO',
      'DATA DE ABERTURA',
      'NOME EMPRESARIAL',
      'TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)',
      'PORTE',
      'CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL',
      'LOGRADOURO',
      'NÚMERO',
      'COMPLEMENTO',
      'CEP',
      'BAIRRO/DISTRITO',
      'MUNICÍPIO',
      'UF',
      'ENDEREÇO ELETRÔNICO',
      'TELEFONE',
    ];

    let data = {};

    // Seleciona todos os elementos de rótulo
    const labelElements = document.querySelectorAll(
      'font[style*="font-size: 6pt"]'
    );

    labelElements.forEach((labelElement) => {
      const labelText = labelElement.textContent.trim();

      if (labelsToExtract.includes(labelText)) {
        // O valor está no elemento <b> dentro de um <font> com font-size: 8pt
        const valueElement = labelElement.parentElement.querySelector(
          'font[style*="font-size: 8pt"] b'
        );

        if (valueElement) {
          const valueText = valueElement.textContent.trim();
          data[labelText] = valueText;
        }
      }
    });

    return data;
  });
}

// Função para salvar os dados em um arquivo JSON
function salvarDadosEmJSON(data, cnpjSemPontuacao) {
  // Criar pasta CNPJ_extraidos, se não existir
  const folderPath = path.join(__dirname, 'CNPJ_extraidos');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const fileName = `DadosCNPJ_${cnpjSemPontuacao}.json`;
  const filePath = path.join(folderPath, fileName);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
  console.log(`Dados extraídos e salvos em ${filePath}`);
}

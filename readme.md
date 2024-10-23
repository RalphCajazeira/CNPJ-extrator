# Extrair Dados de CNPJ

Este projeto permite extrair informações de empresas a partir do site da Receita Federal do Brasil, após a validação manual do reCAPTCHA. Os dados são extraídos diretamente da página e salvos em um arquivo JSON na pasta `CNPJ_extraidos`.

## **Índice**

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Exemplo de Saída](#exemplo-de-saída)
- [Personalizações](#personalizações)
- [Notas Importantes](#notas-importantes)
- [Dependências](#dependências)
- [Contato](#contato)
- [Licença](#licença)
- [Código Fonte](#código-fonte)
- [Sugestões para Futuras Implementações](#sugestões-para-futuras-implementações)
- [Contribuições](#contribuições)

---

## **Pré-requisitos**

- **Node.js** (versão 12 ou superior) instalado em sua máquina.
- **npm** (geralmente instalado junto com o Node.js).

---

## **Instalação**

1. **Clone o repositório ou faça o download dos arquivos.**

   ```bash
   git clone https://github.com/RalphCajazeira/cnpj-extrair-dados.git
   ```

2. **Navegue até o diretório do projeto no terminal:**

   ```bash
   cd cnpj-extrair-dados
   ```

3. **Crie o arquivo `package.json` com o tipo de módulo ES:**

   ```bash
   npm init -y
   ```

   Edite o `package.json` para incluir o campo `"type": "module"`:

   ```json
   {
     "name": "cnpj-extrair-dados",
     "version": "1.0.0",
     "type": "module",
     "dependencies": {
       "puppeteer": "^20.8.1"
     }
   }
   ```

4. **Instale as dependências necessárias:**

   ```bash
   npm install puppeteer
   ```

---

## **Como Usar**

1. **Abra o arquivo `extrairCNPJ.js` em um editor de código.**

2. **Localize a linha onde o CNPJ é definido:**

   ```javascript
   const cnpj = '00.000.000/0001-00'; // Substitua pelo CNPJ desejado
   ```

   - Substitua `'00.000.000/0001-00'` pelo CNPJ que deseja consultar.

3. **Salve o arquivo após fazer as alterações.**

4. **No terminal, execute o script:**

   ```bash
   node extrairCNPJ.js
   ```

5. **Interaja com o navegador:**

   - O navegador será aberto automaticamente.
   - Aguarde até que a página de consulta carregue e o CNPJ seja preenchido.
   - **Complete o reCAPTCHA manualmente e clique em "Consultar".**

6. **Aguarde a extração dos dados:**

   - Após a consulta, o script extrairá os dados da página de resultados.
   - Os dados serão salvos em um arquivo JSON na pasta `CNPJ_extraidos`.

7. **Verifique o resultado:**

   - Acesse a pasta `CNPJ_extraidos` no diretório do projeto.
   - O arquivo será nomeado como `DadosCNPJ_<cnpjSemPontuacao>.json`.

---

## **Exemplo de Saída**

Arquivo: `CNPJ_extraidos/DadosCNPJ_00000000000100.json`

```json
{
    "NÚMERO DE INSCRIÇÃO": "00.000.000/0001-00",
    "DATA DE ABERTURA": "01/01/2000",
    "NOME EMPRESARIAL": "EMPRESA FICTÍCIA DE EXEMPLO LTDA",
    "TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)": "EXEMPLO COMÉRCIO",
    "PORTE": "ME",
    "CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL": "47.00-1-00 - Comércio varejista de produtos de exemplo",
    "LOGRADOURO": "RUA EXEMPLO",
    "NÚMERO": "123",
    "COMPLEMENTO": "SALA 1",
    "CEP": "00.000-000",
    "BAIRRO/DISTRITO": "BAIRRO EXEMPLO",
    "MUNICÍPIO": "CIDADE EXEMPLO",
    "UF": "EX",
    "ENDEREÇO ELETRÔNICO": "contato@exemplo.com.br",
    "TELEFONE": "(00) 0000-0000"
}
```

---

## **Personalizações**

- **Consultar múltiplos CNPJs:**

  - Você pode modificar o script para ler uma lista de CNPJs de um arquivo e iterar sobre eles.
  - Lembre-se de que cada consulta exigirá interação manual com o reCAPTCHA.

- **Adicionar mais campos:**

  - Para extrair mais informações, adicione os rótulos correspondentes ao array `labelsToExtract` na função `extrairDadosDaPagina`.

---

## **Notas Importantes**

- **Interação Manual:**

  - Devido ao reCAPTCHA, é necessário completar manualmente cada consulta.

- **Uso Responsável:**

  - Certifique-se de utilizar este script de acordo com os termos de uso do site da Receita Federal e as leis aplicáveis.
  - Respeite as políticas de privacidade e evite sobrecarregar os serviços públicos.

- **Requisitos Legais e Éticos:**

  - A extração de dados deve ser feita de forma legal e ética, respeitando os direitos e a privacidade das entidades envolvidas.

---

## **Dependências**

- [puppeteer](https://pptr.dev/): Biblioteca para controlar o Chrome ou Chromium através do Node.js.

---

## **Contato**

Desenvolvido por **RalphMTK**.

- **Email:** [ralphmtk@gmail.com](mailto:ralphmtk@gmail.com)
- **GitHub:** [RalphCajazeira](https://github.com/RalphCajazeira)

---

## **Licença**

Este projeto está licenciado sob os termos da licença MIT.

---

## **Código Fonte**

```javascript
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
    const cnpj = '00.000.000/0001-00'; // Substitua pelo CNPJ desejado
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
```

---

## **Sugestões para Futuras Implementações**

- **Automatização Parcial:**

  - Embora a interação com o reCAPTCHA deva ser manual, você pode automatizar outras partes do processo, como ler múltiplos CNPJs de um arquivo e pausar o script para que você complete o reCAPTCHA para cada um.

- **Interface Gráfica:**

  - Desenvolver uma interface gráfica simples para facilitar o uso por pessoas não técnicas.

- **Tratamento de Erros e Logs:**

  - Melhorar o tratamento de erros e implementar um sistema de logs para monitorar as atividades do script.

---

## **Contribuições**

Contribuições são bem-vindas! Sinta-se à vontade para abrir pull requests ou issues com melhorias, correções ou sugestões.
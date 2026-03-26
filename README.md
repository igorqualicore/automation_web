# Automacao Web - Blog do Agi

Projeto de automacao E2E com Cypress para o desafio tecnico de QA Web, com foco no fluxo de busca de artigos do Blog do Agi.

A proposta desta entrega e demonstrar uma automacao com preocupacao real de manutencao, clareza de desenho e capacidade de execucao em diferentes ambientes.

## Objetivo da entrega

Automatizar o fluxo de pesquisa de artigos do blog com foco em:

- legibilidade
- reaproveitamento
- estabilidade de execucao
- facilidade de manutencao

O projeto foi estruturado para refletir uma entrega de automacao pronta para avaliacao tecnica, com execucao local, pipeline e evidencia de resultados.

## Escopo

O desafio solicita a automacao da pesquisa de artigos do blog. Dentro desse contexto, foram selecionados dois cenarios com maior valor funcional:

- validacao do fluxo principal de busca
- validacao do comportamento esperado quando nao ha resultados

Esses cenarios cobrem tanto a experiencia positiva quanto a resposta do sistema em um estado vazio, reduzindo risco de regressao no fluxo mais importante da funcionalidade.

## Cenarios automatizados

1. Busca com termo valido
   - Acessa o blog.
   - Abre a busca pela lupa do cabecalho.
   - Pesquisa por um termo existente.
   - Valida que a pagina de resultados foi carregada e que existe ao menos um artigo relacionado ao termo pesquisado.

2. Busca com termo sem resultados
   - Acessa o blog.
   - Abre a busca pela lupa do cabecalho.
   - Realiza a pesquisa com um termo inexistente.
   - Valida a mensagem de nenhum resultado encontrado.

## Justificativa dos cenarios

- A busca e um fluxo central de descoberta de conteudo no blog.
- O caminho feliz garante que o usuario encontre artigos relevantes.
- O caminho negativo valida a experiencia de erro e evita regressao em mensagens e estado vazio.

## Arquitetura da automacao

- Page Objects para encapsular a navegacao, os seletores e as validacoes.
- Gherkin em portugues para descrever os cenarios de forma mais funcional e legivel.
- Fixture para separar os dados de busca da implementacao do teste.
- Utils para funcoes auxiliares reutilizaveis.
- Support para configuracoes globais e extensoes do Cypress.

Essa estrutura facilita manutencao, leitura e evolucao da suite sem concentrar toda a logica diretamente no arquivo de teste.

## Criterios tecnicos adotados

- Page Objects para separar fluxo, seletores e validacoes.
- Dados de teste externalizados em fixture.
- Seletores priorizando pontos mais estaveis do DOM.
- Metodos pequenos, com responsabilidade unica.
- Execucao compativel com Windows, Linux e macOS.
- Pipeline com publicacao de artefatos.
- Relatorio HTML simples para evidenciar a execucao.

## Stack utilizada

- JavaScript
- Cypress
- Cucumber / Gherkin
- Page Objects
- Mochawesome Reporter
- GitHub Actions

## Estrutura do projeto

```text
.
|-- .github/
|   `-- workflows/
|       `-- cypress.yml
|-- cypress/
|   |-- e2e/
|   |   |-- feature/
|   |   |   `-- busca-blog.feature
|   |   `-- step_definitions/
|   |       `-- busca-blog.steps.js
|   |-- fixtures/
|   |   `-- searchTerms.json
|   |-- page-objects/
|   |   |-- blogHomePage.js
|   |   `-- searchResultsPage.js
|   `-- support/
|       |-- commands.js
|       |-- e2e.js
|       `-- utils/
|           `-- text.js
|-- cypress.config.js
`-- package.json
```

## Pre-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalacao

```bash
npm install
```

## Como usar o projeto

1. Clone o repositorio.
2. Entre na pasta do projeto.
3. Instale as dependencias com npm install.
4. Escolha o modo de execucao desejado.

Exemplo:

```bash
git clone <url-do-repositorio>
cd automation_web
npm install
```

## Execucao dos testes

Abrir o Cypress em modo interativo:

```bash
npm run cy:open
```

Executar em modo headless:

```bash
npm run cy:run
```

Executar em modo headed:

```bash
npm run cy:run:headed
```

Executar com geracao de relatorio:

```bash
npm run cy:run:report
```

Executar a suite padrao:

```bash
npm test
```

Executar o mesmo fluxo utilizado na pipeline:

```bash
npm run test:ci
```

Observacao:

- Os arquivos .feature ficam em cypress/e2e/feature.
- Os step definitions ficam em cypress/e2e/step_definitions.
- Os dados de teste ficam em cypress/fixtures.
- Os Page Objects ficam em cypress/page-objects.

## Resultado da validacao

Suite validada localmente com sucesso:

- 2 cenarios executados
- 2 cenarios aprovados

Essa validacao foi feita em modo headless com geracao de relatorio HTML.

## Boas praticas aplicadas

- Separacao de responsabilidades com Page Objects.
- Cenarios descritos em linguagem funcional com Gherkin em portugues.
- Uso de seletores mais estaveis e legiveis, priorizando ID no input principal da busca.
- Metodos pequenos e com responsabilidade unica dentro dos Page Objects.
- Dados de teste externalizados em fixture.
- Validacoes focadas em comportamento observavel.
- Configuracao pronta para execucao local e em pipeline.

## Relatorio de execucao

Ao executar a suite com reporter habilitado, o projeto gera um relatorio HTML em:

```text
cypress/reports/html/execution-report.html
```

Na execucao de CI tambem sao gerados os arquivos:

```text
cypress/reports/ci-metadata.json
cypress/reports/logs/terminal.log
```

Esse conjunto permite consolidar status, duracao, evidencias visuais e log bruto da execucao.

## Pipeline

O projeto possui workflow no GitHub Actions para:

- executar a suite em Linux, Windows e macOS
- preservar screenshots de falha
- publicar artefatos da execucao
- gerar um dashboard HTML consolidado com os 3 ambientes

Arquivo: .github/workflows/cypress.yml

## Dashboard consolidado da pipeline

Ao final da workflow, a pipeline publica um artefato consolidado com uma visao unica da execucao nos 3 ambientes.

O dashboard apresenta:

- status por ambiente
- tempo de execucao por ambiente
- totais de testes aprovados, falhos, pendentes e ignorados
- link para o relatorio detalhado de cada ambiente
- link para o log bruto de cada ambiente

Arquivo principal do dashboard:

```text
consolidated-report/index.html
```

## Como avaliar a entrega

Para avaliar rapidamente o projeto, o fluxo recomendado e:

1. instalar as dependencias com npm install
2. executar a suite com npm test
3. consultar o relatorio HTML gerado ao final da execucao
4. abrir os cenarios BDD e os step definitions para entender a organizacao da automacao

Com isso, e possivel validar tanto a organizacao da base quanto a evidência de funcionamento da automacao.

## Observacoes

- O dominio informado no enunciado redireciona para https://blog.agibank.com.br/ e a automacao considera esse comportamento.
- O input principal da busca utiliza o ID search-field, adotado como seletor principal por ser o ponto mais estavel do fluxo.
- O site apresenta excecoes JavaScript intermitentes de terceiros. O tratamento no Cypress foi mantido restrito a mensagens conhecidas do proprio blog para evitar falso negativo na execucao.

## Melhorias futuras

- Incluir testes de acessibilidade na busca.
- Cobrir navegacao para o artigo aberto a partir do resultado.
- Adicionar integracao com dashboard de execucao.
# N8N Browser Agents

Uma extensu00e3o para navegadores baseados em Chromium que facilita a criau00e7u00e3o, anu00e1lise e otimizau00e7u00e3o de workflows no N8N usando modelos de linguagem avanu00e7ados via OpenRouter API.

## Funcionalidades

- **Gerau00e7u00e3o de Workflows**: Crie workflows N8N completos a partir de descriu00e7u00f5es em linguagem natural
- **Anu00e1lise de Workflows**: Analise workflows existentes para identificar problemas e oportunidades de melhoria
- **Integrau00e7u00e3o com Docker**: Gerencie instu00e2ncias locais do N8N diretamente da extensu00e3o
- **Testes Automatizados**: Execute testes de integrau00e7u00e3o em seus workflows via Playwright
- **Exportau00e7u00e3o em Mu00faltiplos Formatos**: Exporte workflows em JSON, formato nativo N8N ou YAML

## Instalau00e7u00e3o para Desenvolvimento

### Pru00e9-requisitos

- Node.js 14 ou superior
- npm ou yarn
- Google Chrome ou outro navegador baseado em Chromium

### Passos para Instalau00e7u00e3o

1. Clone o repositu00f3rio:

```bash
git clone https://github.com/seu-usuario/n8n-browser-agents.git
cd n8n-browser-agents
```

2. Instale as dependu00eancias:

```bash
npm install
# ou
yarn install
```

3. Carregue a extensu00e3o no Chrome:

   - Acesse `chrome://extensions/`
   - Ative o "Modo do desenvolvedor" no canto superior direito
   - Clique em "Carregar sem compactau00e7u00e3o"
   - Selecione a pasta do projeto

## Uso

1. Clique no u00edcone da extensu00e3o na barra de ferramentas do navegador para abrir o popup
2. Na aba "Assistente", vocu00ea pode fazer perguntas sobre o N8N ou solicitar a criau00e7u00e3o de workflows
3. Na aba "Workflows", vocu00ea pode gerar novos workflows a partir de descriu00e7u00f5es ou analisar workflows existentes
4. Na aba "Docker", vocu00ea pode gerenciar instu00e2ncias locais do N8N
5. Na aba "Testes", vocu00ea pode executar testes de integrau00e7u00e3o para seus workflows

## Configurau00e7u00e3o

### OpenRouter API

1. Obtenha uma chave de API em [OpenRouter](https://openrouter.ai/)
2. Na aba "Configurau00e7u00f5es" da extensu00e3o, insira sua chave de API
3. Selecione o modelo de linguagem desejado (GPT-4, Claude, etc.)

### Docker

Para usar a funcionalidade de gerenciamento de Docker:

1. Certifique-se de que o Docker estu00e1 instalado e em execuu00e7u00e3o no seu sistema
2. Na aba "Docker" da extensu00e3o, configure as opu00e7u00f5es de porta e persistu00eancia
3. Clique em "Iniciar Container" para criar e iniciar uma instu00e2ncia do N8N

## Testes

A extensu00e3o inclui testes abrangentes para garantir a qualidade e confiabilidade:

1. Para executar os testes de integrau00e7u00e3o, abra o arquivo `tests/run-tests.html` no navegador
2. Ou execute via npm:

```bash
npm test
```

## Build

Para criar um pacote distribuu00edvel da extensu00e3o:

```bash
npm run build
```

O arquivo `.zip` seru00e1 gerado na pasta `dist/`.

## Estrutura do Projeto

```
n8n-browser-agents/
u251cu2500u2500 background/        # Scripts de background
u251cu2500u2500 content/          # Scripts de conteu00fado injetados nas pu00e1ginas
u251cu2500u2500 lib/              # Bibliotecas e classes compartilhadas
u251cu2500u2500 popup/            # Interface do usuu00e1rio da extensu00e3o
u251cu2500u2500 tests/            # Testes de integrau00e7u00e3o
u251cu2500u2500 options/          # Pu00e1gina de opu00e7u00f5es da extensu00e3o
u251cu2500u2500 assets/           # Recursos estu00e1ticos (imagens, u00edcones)
u251cu2500u2500 manifest.json     # Manifesto da extensu00e3o
u251cu2500u2500 package.json      # Configurau00e7u00e3o do npm
u251cu2500u2500 build.js          # Script de build
u251cu2500u2500 README.md         # Documentau00e7u00e3o
u2514u2500u2500 DESENVOLVIMENTO.md # Documentau00e7u00e3o de desenvolvimento
```

## Contribuiu00e7u00e3o

Contribuiu00e7u00f5es su00e3o bem-vindas! Por favor, siga estas etapas:

1. Fau00e7a um fork do repositu00f3rio
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Fau00e7a commit das suas mudanu00e7as (`git commit -m 'feat(componente): adiciona nova funcionalidade'`)
4. Fau00e7a push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licenu00e7a

Este projeto estu00e1 licenciado sob a Licenu00e7a MIT - veja o arquivo LICENSE para detalhes.

## Agradecimentos

- [N8N](https://n8n.io/) por fornecer uma plataforma incru00edvel de automau00e7u00e3o de workflows
- [OpenRouter](https://openrouter.ai/) por fornecer acesso a modelos de linguagem avanu00e7ados
- Todos os contribuidores e testadores que ajudaram a melhorar esta extensu00e3o

---

Desenvolvido com u2764ufe0f para a comunidade N8N

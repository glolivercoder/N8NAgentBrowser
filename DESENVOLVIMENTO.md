# Guia de Desenvolvimento - N8N Browser Agents

Este documento contém diretrizes, padrões e o checklist de desenvolvimento para a extensão N8N Browser Agents.

## Estrutura do Projeto

```
N8NBrowseragents/
├── manifest.json           # Configuração da extensão Chrome
├── background/             # Service worker e lógica de background
│   ├── background.js       # Entry point do service worker
│   └── api-handlers.js     # Handlers para comunicação com APIs
├── content/                # Scripts que são injetados nas páginas do N8N
│   ├── n8n-content.js      # Script principal para interface com N8N
│   └── ui-components.js    # Componentes de UI injetados
├── popup/                  # Interface principal da extensão
│   ├── popup.html          # HTML da popup
│   ├── popup.js            # Lógica da popup
│   └── popup.css           # Estilos da popup
├── lib/                    # Bibliotecas compartilhadas
│   ├── openrouter-api.js   # Integração com OpenRouter
│   ├── n8n-api.js          # Integração com API do N8N
│   ├── n8n-rag-system.js   # Sistema RAG para N8N
│   ├── n8n-agent.js        # Agente especializado em N8N
│   ├── n8n-agent-integration.js # Integração do agente com a extensão
│   ├── n8n-docker-integration.js # Integração com Docker para N8N
│   ├── mcp-integration.js  # Integração com MCP Playwright e File System
│   ├── n8n-test-utils.js   # Utilitários para testes do agente
│   └── utils.js            # Funções utilitárias
├── assets/                 # Recursos estáticos
│   ├── icons/              # Ícones da extensão
│   └── templates/          # Templates de workflows
└── _locales/               # Arquivos de internacionalização
```

## Checklist de Desenvolvimento

### Fase 1: Configuração Inicial e Estrutura

- [ ] Criar estrutura básica de diretórios
- [ ] Configurar manifest.json com permissões necessárias
- [ ] Implementar background service worker básico
- [ ] Criar interface popup inicial
- [ ] Configurar sistema de build (webpack/rollup)
- [ ] Implementar sistema de armazenamento para configurações

### Fase 2: Integração com OpenRouter

- [ ] Implementar classe OpenRouterAPI (já concluído)
- [ ] Adicionar interface para configuração da API key
- [ ] Implementar seleção de modelos disponíveis
- [ ] Criar componentes de UI para exibição de resultados
- [ ] Adicionar indicadores de uso/créditos da API
- [ ] Implementar cache para reduzir chamadas à API

### Fase 3: Funcionalidades Principais

- [ ] Implementar geração de workflows a partir de descrições
- [ ] Criar analisador de workflows existentes
- [ ] Desenvolver assistente de configuração de nós
- [ ] Implementar biblioteca de templates
- [ ] Adicionar funcionalidade de exportação/importação
- [ ] Criar sistema de histórico de interações

### Fase 4: Integração com N8N

- [x] Implementar detecção automática de instância N8N
- [x] Criar content scripts para injeção na interface do N8N
- [x] Desenvolver API para comunicação com o N8N
- [x] Implementar sincronização de workflows
- [ ] Adicionar suporte a diferentes versões do N8N
- [x] Criar sistema de validação de workflows gerados

### Fase 4.1: Integração com Docker

- [x] Implementar classe para gerenciamento de containers Docker
- [x] Criar funções para gerar arquivos docker-compose.yml
- [x] Desenvolver comandos para iniciar/parar/reiniciar containers N8N
- [x] Implementar verificação de status do container
- [x] Adicionar suporte a configurações personalizadas
- [ ] Implementar logs e monitoramento de containers

### Fase 4.2: Integração com MCP

- [x] Implementar integração com MCP Playwright
- [x] Configurar clone do repositório MCP Playwright
- [x] Criar funções para executar testes Playwright em workflows N8N
- [x] Desenvolver gerador de scripts de teste para workflows
- [x] Implementar integração com MCP File System
- [ ] Adicionar suporte a operações de arquivo para configurações

### Fase 5: UI/UX

- [ ] Desenvolver tema consistente com a identidade do N8N
- [ ] Implementar componentes de UI responsivos
- [ ] Adicionar animações e transições
- [ ] Criar tour de introdução para novos usuários
- [ ] Implementar atalhos de teclado
- [ ] Adicionar suporte a temas claro/escuro

### Fase 6: Testes e Qualidade

- [ ] Configurar ambiente de testes unitários
- [ ] Implementar testes de integração
- [ ] Criar testes end-to-end
- [ ] Implementar validação de código (ESLint)
- [ ] Configurar CI/CD para testes automatizados
- [ ] Realizar testes de usabilidade

### Fase 7: Documentação e Distribuição

- [ ] Criar documentação de uso
- [ ] Desenvolver documentação técnica
- [ ] Preparar screenshots e vídeos para Chrome Web Store
- [ ] Configurar página na Chrome Web Store
- [ ] Preparar estratégia de versões e atualizações
- [ ] Criar canal para feedback dos usuários

## Integração Docker e MCP

### Docker para N8N

A extensão suporta a inicialização e gerenciamento de instâncias N8N via Docker. Isso permite que o agente N8N possa criar, configurar e gerenciar automaticamente ambientes N8N locais.

#### Inicialização via Docker

```javascript
// Exemplo de uso da integração Docker
const n8nAgent = new N8NAgent();
await n8nAgent.init();

// Gerar arquivo docker-compose.yml
const dockerComposeFile = n8nAgent.generateDockerComposeFile({
  port: 5678,
  protocol: 'http',
  host: 'localhost',
  dataPath: './n8n-data'
});

// Criar setup Docker
const setupResult = await n8nAgent.createN8NDockerSetup('./n8n-docker', {
  port: 5678
});

// Verificar status do container
const containerStatus = await n8nAgent.getN8NContainerStatus();
```

#### Comandos Docker Disponíveis

- `generateDockerComposeFile()`: Gera um arquivo docker-compose.yml para N8N
- `generateDockerRunCommand()`: Gera um comando docker run para N8N
- `isN8NContainerRunning()`: Verifica se o container N8N está em execução
- `getN8NContainerStatus()`: Obtém informações detalhadas sobre o container
- `getDockerCommands()`: Retorna comandos Docker para gerenciar o container
- `getDockerComposeCommands()`: Retorna comandos Docker Compose
- `createN8NDockerSetup()`: Cria uma configuração Docker completa para N8N

### Integração MCP

A extensão integra-se com o Model Context Protocol (MCP) para permitir testes automatizados e operações de sistema de arquivos. Isso inclui:

1. **MCP Playwright**: Para testes automatizados de workflows N8N
2. **MCP File System**: Para operações de sistema de arquivos

#### Uso do MCP Playwright

```javascript
// Exemplo de uso da integração MCP Playwright
const n8nAgent = new N8NAgent();
await n8nAgent.init();

// Clonar repositório MCP Playwright
const cloneResult = await n8nAgent.clonePlaywrightRepo('./mcp-playwright');

// Criar script de teste para um workflow
const workflow = await n8nAgent.createWorkflow('Workflow de teste');
const testScript = await n8nAgent.createN8NPlaywrightTest(workflow, {
  n8nUrl: 'http://localhost:5678',
  username: 'admin@example.com',
  password: 'password'
});

// Executar teste Playwright
const testResult = await n8nAgent.runPlaywrightTest('./test-script.js');
```

#### Uso do MCP File System

```javascript
// Exemplo de uso da integração MCP File System via MCPIntegration
const mcpIntegration = new MCPIntegration();
await mcpIntegration.initialize();

// Ler arquivo
const fileContent = await mcpIntegration.readFile('./docker-compose.yml');

// Escrever arquivo
const writeResult = await mcpIntegration.writeFile('./n8n-config.json', JSON.stringify(config));

// Executar comando
const commandResult = await mcpIntegration.executeCommand('docker-compose up -d');
```

### Ativação Automática

Quando a extensão é acionada, ela automaticamente:

1. Verifica se há uma instância N8N em execução via Docker
2. Se não houver, oferece a opção de iniciar uma nova instância
3. Inicializa as integrações MCP (Playwright e File System)
4. Clona o repositório MCP Playwright se necessário

Esta integração permite que o agente N8N possa:

- Criar e gerenciar instâncias N8N locais via Docker
- Executar testes automatizados em workflows
- Manipular arquivos de configuração e scripts
- Executar comandos do sistema para gerenciamento do ambiente

## Padrões de Código

### Commits

- Commits pequenos e focados em uma única tarefa
- Mensagens de commit seguindo o padrão Conventional Commits:
  - `feat(component): add new feature`
  - `fix(api): resolve connection issue`
  - `docs(readme): update installation instructions`
  - `style(popup): improve button alignment`
  - `refactor(background): simplify message handling`
  - `test(openrouter): add unit tests for API class`
  - `chore(deps): update dependencies`

### JavaScript

- Utilizar ES6+ com módulos
- Preferir funções assíncronas (async/await) em vez de callbacks
- Documentar funções e classes com JSDoc
- Utilizar classes para encapsular funcionalidades relacionadas
- Evitar variáveis globais, preferir módulos e closures

### Testes

- Escrever testes unitários para todas as funções principais
- Implementar testes de integração para fluxos críticos
- Utilizar mocks para APIs externas
- Garantir cobertura de código de pelo menos 70%

### Segurança

- Nunca armazenar chaves API em código
- Utilizar storage.local para dados sensíveis
- Solicitar apenas as permissões mínimas necessárias
- Validar todas as entradas do usuário
- Implementar proteção contra XSS em conteúdo dinâmico
- Seguir as melhores práticas de segurança do Chrome Extensions

## Melhores Práticas

1. **Performance**
   - Minimizar o número de chamadas à API
   - Utilizar cache para dados frequentemente acessados
   - Evitar bloqueio da thread principal
   - Implementar lazy loading para recursos pesados

2. **UX/UI**
   - Fornecer feedback imediato para ações do usuário
   - Implementar indicadores de carregamento para operações longas
   - Manter consistência visual com a interface do N8N
   - Garantir acessibilidade (contraste, navegação por teclado)

3. **Manutenção**
   - Manter dependências atualizadas
   - Documentar decisões de arquitetura
   - Implementar logging para facilitar depuração
   - Seguir princípios SOLID

4. **Compatibilidade**
   - Testar em diferentes versões do Chrome
   - Garantir compatibilidade com diferentes versões do N8N
   - Considerar suporte a outros navegadores (Firefox, Edge)

## Fluxo de Trabalho de Desenvolvimento

1. Criar uma branch para a feature/fix (`feature/nome-da-feature` ou `fix/nome-do-bug`)
2. Desenvolver e testar localmente
3. Criar pull request com descrição detalhada
4. Passar por code review
5. Mesclar na branch principal após aprovação

## Recursos e Referências

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [N8N API Documentation](https://docs.n8n.io/api/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Desenvolvido com ❤️ para a comunidade N8N

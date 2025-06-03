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

## Checklist de Desenvolvimento para MVP

### Fase 1: Configuração Inicial e Estrutura (PRIORIDADE ALTA)

- [x] Criar estrutura básica de diretórios
- [x] Configurar manifest.json com permissões necessárias
- [x] Implementar background service worker básico
- [x] Criar interface popup inicial
- [ ] ~~Configurar sistema de build (webpack/rollup)~~ (não necessário para versão de teste)
- [x] Implementar sistema de armazenamento para configurações

### Fase 2: Integração com OpenRouter (PRIORIDADE ALTA)

- [x] Implementar classe OpenRouterAPI
- [x] Adicionar interface para configuração da API key
- [x] Implementar seleção de modelos disponíveis
- [x] Criar componentes de UI para exibição de resultados
- [ ] ~~Adicionar indicadores de uso/créditos da API~~ (pode ser adicionado após versão de teste)
- [ ] ~~Implementar cache para reduzir chamadas à API~~ (pode ser adicionado após versão de teste)

### Fase 3: Funcionalidades Essenciais (PRIORIDADE ALTA)

- [x] Implementar geração de workflows a partir de descrições
- [ ] Criar analisador básico de workflows existentes
- [ ] Desenvolver assistente simples de configuração de nós
- [x] Implementar biblioteca mínima de templates
- [x] Adicionar funcionalidade de exportação/importação
- [ ] ~~Criar sistema de histórico de interações~~ (pode ser adicionado após versão de teste)

### Fase 3.1: Integração Docker (PRIORIDADE ALTA)

- [x] Implementar controle de containers Docker (iniciar/parar/reiniciar)
- [x] Adicionar geração de docker-compose.yml
- [x] Implementar visualização de logs do container
- [x] Adicionar funcionalidade de auto-refresh de logs
- [x] Implementar verificação de status do container

## Próximos Passos para MVP

### Tarefas Pendentes Prioritárias

1. **Testes de Integração**
   - [ ] Testar integração completa entre UI e background script
   - [ ] Verificar comunicação com OpenRouter em diferentes cenários
   - [ ] Testar ciclo completo de geração de workflow e exportação

2. **Correções de UI**
   - [ ] Resolver problemas de responsividade na interface
   - [ ] Garantir feedback visual adequado durante operações assíncronas
   - [ ] Verificar tratamento de erros em todos os fluxos principais
   - [x] Corrigir erros de sintaxe no arquivo n8n-agent-ui.js
   - [x] Remover métodos duplicados e reorganizar código
   - [x] Implementar método updateUIFromState para sincronização da interface

3. **Melhorias na Integração Docker**
   - [x] Corrigir referências a elementos DOM no método displayContainerLogs
   - [x] Adicionar event listeners para botões de controle do container
   - [x] Implementar auto-refresh de logs com toggle
   - [x] Corrigir parâmetros enviados nas requisições ao background script
   - [ ] Testar integração completa com Docker em diferentes ambientes

4. **Documentação Mínima**
   - [ ] Criar README.md com instruções de instalação
   - [ ] Documentar fluxo básico de uso da extensão
   - [ ] Adicionar screenshots da interface

5. **Empacotar para Distribuição**
   - [ ] Verificar manifesto para compatibilidade com Chrome Web Store
   - [ ] Criar assets necessários (ícones em diferentes tamanhos)
   - [ ] Preparar descrição e materiais para submissão

## Nota sobre a Versão de Teste

A versão de teste da extensão Chrome deve focar nas funcionalidades essenciais que demonstram o valor principal da ferramenta:

1. **Integração com IA**: Capacidade de gerar workflows do N8N a partir de descrições em linguagem natural
2. **Gerenciamento Docker**: Facilidade para iniciar/parar/monitorar uma instância N8N em container Docker
3. **Exportação/Importação**: Funcionalidade básica para exportar workflows gerados

Os recursos avançados como cache, histórico detalhado e indicadores de uso podem ser implementados após a validação inicial do conceito.

## Padrões de Código e Boas Práticas

### Commits

- **Commits Pequenos e Focados**: Cada commit deve conter apenas mudanças relacionadas a uma única tarefa ou problema.
- **Mensagens Padronizadas**: Usar o padrão de Conventional Commits
  - Formato: `<tipo>(escopo): descrição`
  - Exemplos: 
    - `feat(auth): adiciona suporte ao login via OAuth`
    - `fix(ui): corrige alinhamento do botão em dispositivos móveis`
- **Não Comitar Código Incompleto**: Apenas fazer commits de código funcional e testado.

### Testes

- **Cobertura de Testes**: Todo novo código deve vir acompanhado de testes unitários.
- **Testes Automatizados**: Configurar pipelines CI/CD para garantir que todo commit seja testado automaticamente.
- **Evitar Dependências Externas nos Testes**: Usar mocks ou stubs para simular dependências externas.

### Eficiência e Qualidade

- **Modularidade**: Dividir o código em módulos pequenos, com responsabilidades bem definidas.
- **Evitar Código Redundante**: Verificar se existe uma função ou módulo que já atende à necessidade.
- **Performance**: Monitorar o desempenho do código e evitar soluções ineficientes.
- **Convenções Consistentes**: Adotar um padrão claro para nomes de variáveis, funções e classes.
- **Eliminar Código Morto**: Remover trechos de código não utilizados ou comentados.
- **Comentários Significativos**: Usar comentários apenas quando necessário para explicar lógica complexa.

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

## Ordem de Desenvolvimento Recomendada

### 1. Configuração Básica e Infraestrutura (Prioridade Alta)

1. **Implementar background service worker básico**
   - Configurar o listener de mensagens para comunicação entre componentes
   - Implementar gerenciamento de estado básico
   - Garantir que o service worker permaneça ativo quando necessário

2. **Criar sistema de armazenamento para configurações**
   - Implementar storage.local para dados sensíveis (API keys)
   - Criar funções para salvar/carregar configurações

3. **Finalizar interface popup inicial**
   - Implementar navegação básica entre abas
   - Garantir que os elementos UI já implementados funcionem corretamente

### 2. Integração com OpenRouter (Prioridade Alta)

1. **Adicionar interface para configuração da API key**
   - Criar formulário seguro para armazenamento da chave
   - Implementar validação da chave

2. **Implementar cache para reduzir chamadas à API**
   - Armazenar resultados frequentes para economizar tokens
   - Implementar estratégia de invalidação de cache

### 3. Funcionalidades Principais Essenciais (Prioridade Alta)

1. **Implementar geração de workflows a partir de descrições**
   - Conectar a interface com a API OpenRouter
   - Garantir que o JSON gerado seja válido para o N8N

2. **Criar analisador básico de workflows existentes**
   - Implementar parser para workflows do N8N
   - Criar visualização simplificada da estrutura

### 4. Refinamento da Integração com Docker (Prioridade Média)

1. **Implementar logs e monitoramento de containers**
   - Adicionar visualização de logs do container N8N
   - Implementar notificações de status

### 5. Finalização da Integração com MCP (Prioridade Média)

1. **Adicionar suporte a operações de arquivo para configurações**
   - Implementar leitura/escrita de arquivos de configuração
   - Garantir tratamento de erros adequado

### 6. Testes e Validação (Prioridade Alta)

1. **Implementar testes unitários para componentes críticos**
   - Testar integração com OpenRouter
   - Testar geração de workflows
   - Testar comunicação com Docker

2. **Criar testes de integração para fluxos principais**
   - Testar fluxo completo: configuração → geração → execução

### 7. Segurança e Robustez (Prioridade Alta)

1. **Revisar permissões no manifest.json**
   - Garantir que apenas as permissões necessárias estejam solicitadas

2. **Implementar validação de entrada em todos os campos**
   - Sanitizar inputs do usuário
   - Prevenir injeção de código

3. **Adicionar tratamento de erros abrangente**
   - Implementar fallbacks para falhas de API
   - Criar mensagens de erro amigáveis

### 8. Refinamentos de UX/UI (Prioridade Média)

1. **Implementar indicadores de carregamento**
   - Adicionar feedback visual para operações longas

2. **Melhorar consistência visual**
   - Alinhar com a identidade do N8N

### 9. Documentação e Finalização (Prioridade Média)

1. **Atualizar documentação**
   - Completar README com instruções de instalação e uso
   - Documentar APIs e componentes principais

2. **Preparar para distribuição**
   - Configurar sistema de build (webpack/rollup)
   - Criar pacote para Chrome Web Store

---

Desenvolvido com ❤️ para a comunidade N8N

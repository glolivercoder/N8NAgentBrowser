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

## Novas Funcionalidades Solicitadas (Prioridade Pós-MVP e Resolução de Bugs)

Antes de iniciar estas novas funcionalidades, é crucial resolver os bugs pendentes relacionados ao menu de contexto (`tabId inválido`) e ao carregamento da aba Docker (`Container de erro não encontrado`).

### Aba "Configurações" na Extensão:
- **Chave API OpenRouter:**
    - [ ] Adicionar campo de input para o usuário inserir e salvar a chave da API OpenRouter.
    - [ ] Utilizar a chave API configurada para interagir com o OpenRouter.
- **Token N8N:**
    - [ ] Adicionar campo de input para o usuário inserir e salvar um Token N8N.
    - [ ] Utilizar o token para autenticar e interagir com a instância N8N do usuário.
- **Seleção de Modelos de IA:**
    - [ ] Implementar menu dropdown com funcionalidade de busca na aba "Configurações".
    - [ ] Popular o dropdown com modelos disponíveis (ex: via API OpenRouter, usando a chave configurada).
    - [ ] Salvar o modelo selecionado (`chrome.storage.local`) para uso pelo agente (`N8NAgent`).

### Integração com a Interface Web do N8N (via Content Script):
- **Barra de Interação no Rodapé do N8N:**
    - [ ] Desenvolver e injetar uma barra de input/área de texto no rodapé da interface web do N8N.
    - [ ] Permitir que o usuário envie perguntas ou prompts diretamente desta barra para o agente da extensão.
    - [ ] A comunicação deve ser feita entre o content script e o background script/agente.

### Capacidades Aprimoradas do Agente (`N8NAgent`):
- **Utilização de Configurações Salvas:**
    - [ ] Garantir que o `N8NAgent` acesse e utilize as chaves de API (OpenRouter), tokens (N8N) e modelos de IA selecionados (salvos nas configurações da extensão) para todas as operações relevantes.
- **Criação Avançada no N8N:**
    - [ ] Capacitar o agente para criar nós, workflows completos e credenciais na instância N8N do usuário, utilizando as configurações e o modelo de IA apropriado, por meio da API do N8N.
- **Refatoração `mcp-integration.js` para Integrações Reais:**
    - [ ] Substituir a lógica simulada no `mcp-integration.js` por integrações funcionais.
    - [ ] Investigar e implementar o uso de `chrome.runtime.sendNativeMessage` para comunicação com uma aplicação host nativa.
    - [ ] A aplicação host nativa lidaria com tarefas que exigem acesso ao sistema de arquivos ou execução de processos externos (ex: clonar repositórios Git, executar testes Playwright).


## Melhorias de Responsividade Implementadas

As seguintes melhorias foram implementadas para garantir que a interface da extensão funcione bem em diferentes tamanhos de tela:

### Ajustes Gerais

- Implementação de media queries para telas de 360px e 320px
- Ajuste de tamanhos de fonte e espaçamentos para dispositivos menores
- Otimização de layouts para melhor visualização em telas pequenas

### Navegação

- Barra de abas com rolagem horizontal em telas pequenas
- Redução de padding e tamanho de fonte dos botões de abas em telas menores
- Ajuste de espaçamento no conteúdo das abas para melhor aproveitamento do espaço

### Formulários e Controles

- Reorganização de formulários para exibição em coluna em telas pequenas
- Ajuste de campos de entrada para largura total em dispositivos móveis
- Melhoria nos controles de ações rápidas com grid responsivo

### Docker e Logs

- Painel de status do Docker otimizado para telas pequenas
- Controles de container organizados em grid flex
- Área de logs com altura máxima e rolagem para melhor visualização

### Testes de Integração

- Botões de teste organizados em layout responsivo
- Resultados de teste com quebra de palavras adequada
- Sumário de testes otimizado para telas pequenas

### Geração e Análise de Workflow

- Exibição de JSON com altura máxima e rolagem
- Botões de ação reorganizados em coluna em telas pequenas
- Ajuste de tamanho de fonte para melhor legibilidade

## Tarefas Pendentes e Concluídas

1. **Testes de Integração OpenRouter**
   - [x] Implementar testes de comunicação entre UI e background script
   - [x] Adicionar interface para execução de testes na aba de configurações
   - [x] Implementar exibição de resultados de testes na interface
   - [x] Verificar comunicação com OpenRouter em diferentes cenários
   - [x] Testar ciclo completo de geração de workflow e exportação
     - [x] Implementar teste de geração de workflows com diferentes requisitos
     - [x] Adicionar suporte para análise de workflows gerados
     - [x] Implementar sugestão de melhorias para workflows
     - [x] Adicionar exportação de workflows em diferentes formatos (JSON, N8N, YAML)

2. **Correções de UI**
   - [x] Resolver problemas de responsividade na interface
     - [x] Melhorar navegação por abas em telas pequenas
     - [x] Ajustar layout de formulários e botões para dispositivos móveis
     - [x] Implementar media queries para telas de 360px e 320px
     - [x] Otimizar exibição de logs e resultados de testes em telas menores
     - [x] Melhorar responsividade da área de Docker e testes de integração
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
   - [x] Implementar testes automatizados para funcionalidades Docker
   - [x] Implementar métodos para geração, cópia e salvamento do docker-compose
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
- [x] Implementar logs e monitoramento de containers
  - [x] Exibir logs do container em tempo real
  - [x] Adicionar controles responsivos para gerenciamento de containers
  - [x] Implementar auto-refresh de logs com toggle

### Fase 4.2: Integração com MCP

- [x] Implementar integração com MCP Playwright
  - [x] Desenvolver classe de comunicação com MCP Playwright
  - [x] Implementar métodos para execução de testes automatizados
  - [x] Criar interface para configuração e execução de testes
- [x] Configurar clone do repositório MCP Playwright
  - [x] Implementar métodos para clonar e atualizar repositório
  - [x] Adicionar suporte a configurações de branch e commit específicos
- [x] Criar funções para executar testes Playwright em workflows N8N
  - [x] Desenvolver API para execução de testes em workflows
  - [x] Implementar coleta e exibição de resultados de testes
  - [x] Adicionar suporte a diferentes ambientes de teste
- [x] Desenvolver gerador de scripts de teste para workflows
  - [x] Criar templates para diferentes tipos de testes
  - [x] Implementar geração dinâmica baseada em workflows
  - [x] Adicionar validação de scripts gerados
- [x] Implementar integração com MCP File System
  - [x] Desenvolver métodos para leitura e escrita de arquivos
  - [x] Implementar operações de backup e restauração
  - [x] Adicionar suporte a diferentes formatos de arquivo
- [ ] Adicionar suporte a operações de arquivo para configurações
  - [ ] Implementar importação/exportação de configurações
  - [ ] Desenvolver sistema de templates de configuração
  - [ ] Adicionar validação de configurações importadas

### Fase 5: UI/UX

- [ ] Desenvolver tema consistente com a identidade do N8N
  - [ ] Criar paleta de cores alinhada com a marca N8N
  - [ ] Desenvolver sistema de ícones consistente
  - [ ] Implementar tipografia padronizada
- [x] Implementar componentes de UI responsivos
  - [x] Otimizar layout para dispositivos móveis (360px e 320px)
    - [x] Implementar media queries específicas para breakpoints de 360px e 320px
    - [x] Ajustar tamanhos de fonte e espaçamento para telas pequenas
    - [x] Reorganizar elementos para priorizar conteúdo essencial
  - [x] Melhorar navegação por abas em telas pequenas
    - [x] Implementar rolagem horizontal para abas
    - [x] Reduzir padding e espaçamento entre abas em telas pequenas
    - [x] Adicionar indicadores visuais para abas ativas
  - [x] Ajustar formulários e controles para melhor usabilidade
    - [x] Reorganizar formulários para exibição em coluna em dispositivos móveis
    - [x] Aumentar tamanho de áreas clicaveis para melhor uso em touch
    - [x] Implementar campos de entrada com largura total em telas pequenas
  - [x] Implementar exibição responsiva para logs e resultados de testes
    - [x] Criar área de logs com altura máxima e rolagem em telas pequenas
    - [x] Ajustar exibição de JSON para telas pequenas com quebra de linha apropriada
    - [x] Organizar botões e controles em grid flexível para diferentes tamanhos de tela
- [ ] Adicionar animações e transições
  - [ ] Implementar transições suaves entre abas
  - [ ] Adicionar animações de feedback para ações do usuário
  - [ ] Criar indicadores visuais de carregamento
- [ ] Criar tour de introdução para novos usuários
  - [ ] Desenvolver sistema de tooltips para funcionalidades principais
  - [ ] Implementar tutorial passo-a-passo para primeiros usuários
  - [ ] Criar documentação interativa embutida
- [ ] Implementar atalhos de teclado
  - [ ] Adicionar atalhos para navegação entre abas
  - [ ] Implementar atalhos para ações comuns (iniciar/parar Docker, executar testes)
  - [ ] Criar painel de ajuda com lista de atalhos disponíveis
- [ ] Adicionar suporte a temas claro/escuro
  - [ ] Implementar detecção automática de preferência do sistema
  - [ ] Criar variáveis CSS para fácil alternância entre temas
  - [ ] Garantir contraste adequado em ambos os temas

### Fase 6: Testes e Qualidade

- [ ] Configurar ambiente de testes unitários
  - [ ] Configurar Jest para testes de componentes UI
  - [ ] Implementar mocks para APIs externas
  - [ ] Configurar cobertura de código
- [x] Implementar testes de integração
  - [x] Testes de integração para OpenRouter API
    - [x] Testes de configuração e conexão com API
      - [x] Validação de chaves de API
      - [x] Testes de conexão com diferentes modelos
      - [x] Verificação de limites de tokens e requisições
    - [x] Testes de geração de workflows
      - [x] Geração a partir de descrições em linguagem natural
      - [x] Validação de estrutura de workflows gerados
      - [x] Testes com diferentes complexidades de workflows
    - [x] Testes de ciclo completo (geração, análise, melhorias, exportação)
      - [x] Exportação para formato JSON
      - [x] Exportação para formato N8N nativo
      - [x] Exportação para formato YAML
      - [x] Validação de workflows exportados
  - [x] Testes de integração para Docker
    - [x] Testes de gerenciamento de containers
      - [x] Inicialização e parada de containers
      - [x] Monitoramento de status em tempo real
      - [x] Captura e exibição de logs
    - [x] Testes de geração de docker-compose
      - [x] Configurações personalizadas de portas e volumes
      - [x] Configurações de variáveis de ambiente
      - [x] Validação de arquivos gerados
  - [x] Testes de integração entre UI e background script
      - [x] Testes de comunicação assíncrona via MessageBroker
      - [x] Validação de atualização da UI baseada em mudanças de estado
      - [x] Testes de tratamento de erros na comunicação
      - [x] Verificação de sincronização de estado entre componentes
- [ ] Criar testes end-to-end
- [ ] Implementar validação de código (ESLint)
- [ ] Configurar CI/CD para testes automatizados
- [ ] Realizar testes de usabilidade

### Fase 7: Documentação e Distribuição

- [x] Criar documentação de desenvolvimento
  - [x] Documentação da estrutura do projeto
  - [x] Checklist de tarefas e progresso
  - [x] Documentação de testes implementados
- [ ] Criar documentação de uso para usuários finais
- [ ] Desenvolver documentação técnica completa
- [ ] Preparar documentação para a Chrome Web Store
- [ ] Preparar screenshots e vídeos para Chrome Web Store
- [ ] Configurar página na Chrome Web Store
- [ ] Preparar estratégia de versões e atualizações
- [ ] Criar canal para feedback dos usuários

## Integração com OpenRouter API

A extensão utiliza a OpenRouter API para geração, análise, sugestão de melhorias e exportação de workflows N8N, permitindo a criação de fluxos de trabalho complexos a partir de descrições em linguagem natural.

### Funcionalidades Implementadas

- Configuração da API com diferentes modelos (GPT-4, Claude, etc.)
- Geração de workflows a partir de descrições textuais
- Análise de workflows existentes para identificação de problemas e oportunidades de melhoria
- Sugestão de melhorias para workflows existentes
- Exportação de workflows em diferentes formatos (JSON, N8N nativo, YAML)

### Exemplo de Implementação

```javascript
// Classe OpenRouterAPI para integração com a API
class OpenRouterAPI {
  constructor() {
    this.apiKey = null;
    this.model = 'gpt-4';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.timeout = 60000;
  }
  
  /**
   * Configura a API com chave e modelo
   * @param {Object} config - Configurações da API
   */
  async configure(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || this.model;
    this.timeout = config.timeout || this.timeout;
    
    // Validar configuração
    if (!this.apiKey) {
      throw new Error('API Key é obrigatória para usar a OpenRouter API');
    }
    
    return { success: true, message: 'API configurada com sucesso' };
  }
  
  /**
   * Gera um workflow a partir de uma descrição
   * @param {string} description - Descrição do workflow desejado
   * @returns {Object} - Workflow gerado em formato JSON
   */
  async generateWorkflow(description) {
    try {
      const prompt = `Crie um workflow N8N completo para: ${description}

Retorne apenas o JSON do workflow, sem explicações adicionais.`;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 4000
        }),
        timeout: this.timeout
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${data.error?.message || 'Erro desconhecido'}`);
      }
      
      const workflowText = data.choices[0].message.content;
      
      // Extrair JSON do texto retornado
      const jsonMatch = workflowText.match(/```json
([\s\S]*?)
```/) || 
                       workflowText.match(/```([\s\S]*?)```/) || 
                       [null, workflowText];
      
      const workflowJson = JSON.parse(jsonMatch[1].trim());
      return workflowJson;
    } catch (error) {
      console.error('Erro ao gerar workflow:', error);
      throw error;
    }
  }
  
  /**
   * Analisa um workflow existente
   * @param {Object} workflow - Workflow a ser analisado
   * @returns {Object} - Resultado da análise
   */
  async analyzeWorkflow(workflow) { ... }
  
  /**
   * Sugere melhorias para um workflow
   * @param {Object} workflow - Workflow a ser melhorado
   * @param {Object} analysis - Análise prévia do workflow
   * @returns {Object} - Workflow melhorado
   */
  async suggestImprovements(workflow, analysis) { ... }
  
  /**
   * Exporta um workflow para o formato especificado
   * @param {Object} workflow - Workflow a ser exportado
   * @param {string} format - Formato de exportação (json, n8n, yaml)
   * @returns {string} - Workflow exportado no formato solicitado
   */
  async exportWorkflow(workflow, format) {
    try {
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(workflow, null, 2);
          
        case 'n8n':
          // Formatar especificamente para importação no N8N
          const n8nFormat = {
            name: workflow.name || 'Workflow Gerado',
            nodes: workflow.nodes || [],
            connections: workflow.connections || {},
            active: true,
            settings: workflow.settings || {},
            version: 1
          };
          return JSON.stringify(n8nFormat, null, 2);
          
        case 'yaml':
          // Converter JSON para YAML
          const yamlPrompt = `Converta o seguinte JSON de workflow N8N para formato YAML:

${JSON.stringify(workflow, null, 2)}

Retorne apenas o YAML, sem explicações adicionais.`;
          
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: this.model,
              messages: [{
                role: 'user',
                content: yamlPrompt
              }],
              temperature: 0.3,
              max_tokens: 4000
            }),
            timeout: this.timeout
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(`Erro na API: ${data.error?.message || 'Erro desconhecido'}`);
          }
          
          const yamlText = data.choices[0].message.content;
          
          // Extrair YAML do texto retornado
          const yamlMatch = yamlText.match(/```yaml
([\s\S]*?)
```/) || 
                           yamlText.match(/```([\s\S]*?)```/) || 
                           [null, yamlText];
          
          return yamlMatch[1].trim();
          
        default:
          throw new Error(`Formato de exportação não suportado: ${format}`);
      }
    } catch (error) {
      console.error(`Erro ao exportar workflow para ${format}:`, error);
      throw error;
    }
  }
}
```

### Testes de Integração

A integração com a OpenRouter API foi extensivamente testada para garantir confiabilidade e robustez:

```javascript
// Classe de testes para a integração com OpenRouter
class OpenRouterIntegrationTests {
  constructor(openRouterAPI) {
    this.openRouterAPI = openRouterAPI;
  }
  
  /**
   * Testa o ciclo completo de workflow
   * @returns {Object} - Resultados dos testes
   */
  async testCompleteWorkflowCycle() {
    const testResults = [];
    const workflowDescription = 'Criar um workflow para monitorar emails e salvar anexos';
    
    // Teste de geração de workflow
    const generatedWorkflow = await this.openRouterAPI.generateWorkflow(workflowDescription);
    testResults.push({ 
      name: 'Geração de Workflow', 
      success: !!generatedWorkflow, 
      details: generatedWorkflow ? 'Workflow gerado com sucesso' : 'Falha na geração' 
    });
    
    // Teste de análise de workflow
    const analysis = await this.openRouterAPI.analyzeWorkflow(generatedWorkflow);
    testResults.push({ 
      name: 'Análise de Workflow', 
      success: !!analysis, 
      details: analysis ? 'Análise realizada com sucesso' : 'Falha na análise' 
    });
    
    // Teste de exportação em diferentes formatos
    const formats = ['json', 'n8n', 'yaml'];
    for (const format of formats) {
      const exported = await this.openRouterAPI.exportWorkflow(generatedWorkflow, format);
      testResults.push({ 
        name: `Exportação para ${format.toUpperCase()}`, 
        success: !!exported, 
        details: exported ? `Exportação para ${format} realizada com sucesso` : `Falha na exportação para ${format}` 
      });
    }
    
    return { 
      name: 'Ciclo Completo de Workflow', 
      success: testResults.every(test => test.success), 
      details: testResults 
    };
  }
}
```

## Integração Docker e MCP

### Docker para N8N

A extensão suporta a inicialização e gerenciamento de instâncias N8N via Docker. Isso permite que o agente N8N possa criar, configurar e gerenciar automaticamente ambientes N8N locais.

#### Funcionalidades Implementadas

- Geração dinâmica de arquivos docker-compose.yml
- Inicialização, parada e reinicialização de containers
- Monitoramento de status em tempo real
- Exibição de logs com auto-refresh
- Configurações personalizadas (porta, persistência, variáveis de ambiente)
- Interface responsiva para gerenciamento de containers

#### Exemplos de Uso

##### Inicialização via Docker

```javascript
// Exemplo de uso da integração Docker
const n8nAgent = new N8NAgent();
await n8nAgent.init();

// Gerar arquivo docker-compose.yml com configurações personalizadas
const dockerComposeFile = n8nAgent.generateDockerComposeFile({
  port: 5678,
  dataFolder: './n8n-data',
  enableTelemetry: false,
  environmentVariables: {
    N8N_ENCRYPTION_KEY: 'minha-chave-segura',
    N8N_PROTOCOL: 'https'
  }
});

// Iniciar container
await n8nAgent.startContainer();

// Verificar status
const status = await n8nAgent.checkContainerStatus();
console.log(`Container status: ${status.state}`);

// Obter logs
const logs = await n8nAgent.getContainerLogs();
console.log(logs);

// Parar container
await n8nAgent.stopContainer();
```

##### Gerenciamento via UI

A interface de usuário oferece controles intuitivos para:

- Iniciar/parar/reiniciar containers com feedback visual
- Visualizar logs em tempo real com opção de auto-refresh
- Configurar parâmetros do container (porta, persistência)
- Monitorar status do container com atualização automática
```

### Integração MCP

A extensão utiliza o Model Context Protocol (MCP) para integração com serviços externos, especialmente para testes automatizados e geração de workflows.

#### Funcionalidades Implementadas

- Integração com MCP Playwright para testes automatizados
- Integração com MCP File System para gerenciamento de arquivos
- Geração de scripts de teste para workflows N8N
- Execução de testes end-to-end em workflows

#### Exemplos de Uso

##### Testes com Playwright via MCP

```javascript
// Exemplo de uso da integração MCP Playwright
const mcpPlaywright = new MCPPlaywrightIntegration();
await mcpPlaywright.init();

// Configurar teste para um workflow
const testConfig = {
  workflowId: 'workflow123',
  testName: 'Teste de API',
  testSteps: [
    { action: 'navigate', url: 'http://localhost:5678/workflow/workflow123' },
    { action: 'click', selector: '#execute-workflow-button' },
    { action: 'waitForSelector', selector: '.execution-success', timeout: 5000 }
  ]
};

// Executar teste
const testResult = await mcpPlaywright.runTest(testConfig);
console.log(`Teste concluído: ${testResult.success ? 'Sucesso' : 'Falha'}`);

// Gerar relatório
const report = await mcpPlaywright.generateTestReport(testResult);
```

##### Integração com OpenRouter API

```javascript
// Exemplo de uso da integração OpenRouter para geração de workflows
const openRouter = new OpenRouterAPI();

// Configurar API
await openRouter.configure({
  apiKey: 'sua-api-key',
  model: 'gpt-4'
});

// Gerar workflow a partir de descrição
const workflowDescription = 'Criar um workflow que monitora um email e salva anexos no Google Drive';
const generatedWorkflow = await openRouter.generateWorkflow(workflowDescription);

// Analisar workflow gerado
const analysis = await openRouter.analyzeWorkflow(generatedWorkflow);

// Sugerir melhorias
const improvements = await openRouter.suggestImprovements(generatedWorkflow, analysis);

// Exportar workflow em diferentes formatos
const jsonWorkflow = await openRouter.exportWorkflow(generatedWorkflow, 'json');
const n8nWorkflow = await openRouter.exportWorkflow(generatedWorkflow, 'n8n');
const yamlWorkflow = await openRouter.exportWorkflow(generatedWorkflow, 'yaml');
```

## Implementação da API OpenRouter

A integração com a OpenRouter API é uma parte central da extensão, permitindo a geração automática de workflows N8N a partir de descrições em linguagem natural.

### Arquitetura da Integração

```javascript
class OpenRouterAPI {
  constructor() {
    this.apiKey = null;
    this.model = 'gpt-4';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.timeout = 60000; // 60 segundos
  }

  // Configurar API
  async configure(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || this.model;
    return { success: true };
  }

  // Gerar workflow a partir de descrição
  async generateWorkflow(description) {
    const prompt = `Crie um workflow N8N que: ${description}`;
    const response = await this.callOpenRouter(prompt, {
      temperature: 0.7,
      max_tokens: 2000
    });
    return this.parseWorkflowResponse(response);
  }

  // Analisar workflow gerado
  async analyzeWorkflow(workflow) {
    const prompt = `Analise o seguinte workflow N8N e identifique possíveis problemas ou melhorias: ${JSON.stringify(workflow)}`;
    const response = await this.callOpenRouter(prompt, {
      temperature: 0.5,
      max_tokens: 1000
    });
    return this.parseAnalysisResponse(response);
  }

  // Sugerir melhorias para o workflow
  async suggestImprovements(workflow, analysis) {
    const prompt = `Com base na análise: ${JSON.stringify(analysis)}, sugira melhorias para o workflow: ${JSON.stringify(workflow)}`;
    const response = await this.callOpenRouter(prompt, {
      temperature: 0.7,
      max_tokens: 1500
    });
    return this.parseImprovementsResponse(response);
  }

  // Exportar workflow em diferentes formatos
  async exportWorkflow(workflow, format) {
    const formats = {
      json: () => JSON.stringify(workflow, null, 2),
      n8n: () => this.convertToN8NFormat(workflow),
      yaml: () => this.convertToYAML(workflow)
    };

    if (!formats[format]) {
      throw new Error(`Formato não suportado: ${format}`);
    }

    return formats[format]();
  }
}
```

## Interface Responsíva

A interface da extensão foi projetada para ser totalmente responsiva, funcionando bem em diferentes tamanhos de tela, desde desktops até dispositivos móveis.

### Estrutura CSS Responsíva

```css
/* Estilos base para todos os tamanhos de tela */
.tab-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}

.tab-button {
  padding: 10px 15px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 14px;
}

.tab-button.active {
  border-bottom: 2px solid #ff6d00;
  font-weight: bold;
}

/* Media queries para telas menores */
@media (max-width: 360px) {
  .tab-button {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
  }
  
  .input-field {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .docker-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .log-container {
    max-height: 200px;
    overflow-y: auto;
    font-size: 12px;
  }
}

/* Media queries para telas muito pequenas */
@media (max-width: 320px) {
  .tab-button {
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .button {
    padding: 6px 8px;
    font-size: 11px;
  }
}
```

### Princípios de Design Responsivo Aplicados

1. **Layout Flexível**
   - Uso de flexbox para adaptação a diferentes tamanhos de tela
   - Implementação de `flex-wrap` para reorganização em telas pequenas

2. **Media Queries**
   - Definição de breakpoints para telas de 360px e 320px
   - Ajustes específicos de tamanho, espaçamento e layout para cada breakpoint

3. **Elementos Escaláveis**
   - Uso de unidades relativas (%, em, rem) para tamanhos de fonte e elementos
   - Containers com altura máxima e rolagem para conteúdo extenso

4. **Priorização de Conteúdo**
   - Reorganização de elementos para priorizar conteúdo essencial em telas pequenas
   - Redução de padding e margens para maximizar espaço útil

## Refatoração e Melhorias de Código

O desenvolvimento da extensão incluiu várias fases de refatoração para melhorar a qualidade do código, corrigir problemas e garantir a manutenção a longo prazo.

### Refatoração do n8n-agent-ui.js

O arquivo n8n-agent-ui.js, responsável pela interface do usuário da extensão, passou por uma refatoração completa para resolver diversos problemas:

#### Problemas Corrigidos

- Remoção de métodos duplicados (especialmente o método `setLoading`)
- Correção de problemas de sintaxe (pontos e vírgulas faltando, chaves extras)
- Correção de referências incorretas a elementos DOM
- Reorganização do código para garantir que os métodos estejam completos e não misturados

#### Melhorias Implementadas

- Implementação do método `updateUIFromState` para sincronizar a interface com o estado global
- Melhoria na estrutura de manipulação de eventos
- Separação clara entre lógica de negócios e manipulação de UI
- Implementação de tratamento de erros consistente

#### Exemplo de Código Refatorado

```javascript
// Antes da refatoração - Método duplicado e mal estruturado
function setLoading(isLoading) {
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

function setLoading(isLoading, message) { // Duplicado com assinatura diferente
  const loadingIndicator = document.getElementById('loading-indicator');
  const loadingMessage = document.getElementById('loading-message');
  loadingIndicator.style.display = isLoading ? 'block' : 'none';
  if (message) {
    loadingMessage.textContent = message;
  }
}

// Após refatoração - Método unificado e bem estruturado
class UIManager {
  /**
   * Controla o indicador de carregamento na interface
   * @param {boolean} isLoading - Se deve mostrar ou ocultar o indicador
   * @param {string} [message] - Mensagem opcional para exibir
   */
  setLoading(isLoading, message = null) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingMessage = document.getElementById('loading-message');
    
    if (!loadingIndicator || !loadingMessage) {
      console.error('Elementos de loading não encontrados');
      return;
    }
    
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    
    if (message !== null) {
      loadingMessage.textContent = message;
    }
  }
  
  /**
   * Atualiza a interface com base no estado global
   * @param {Object} state - Estado global da aplicação
   */
  updateUIFromState(state) {
    // Atualizar status do Docker
    this.updateDockerStatus(state.dockerStatus);
    
    // Atualizar configurações da OpenRouter API
    this.updateOpenRouterConfig(state.openRouterConfig);
    
    // Atualizar workflow atual
    if (state.currentWorkflow) {
      this.updateWorkflowDisplay(state.currentWorkflow);
    }
    
    // Atualizar resultados de testes
    if (state.testResults && state.testResults.length > 0) {
      this.updateTestResults(state.testResults);
    }
  }
}
```

### Processo de Refatoração

O processo de refatoração seguiu estas etapas:

1. **Análise do Código Original**
   - Identificação de problemas de sintaxe e estrutura
   - Documentação de métodos duplicados e inconsistências

2. **Divisão em Módulos**
   - Separação do código em partes lógicas
   - Criação de classes para cada funcionalidade principal

3. **Implementação de Padrões**
   - Adoção de padrões de código consistentes
   - Implementação de documentação de código (JSDoc)

4. **Testes e Validação**
   - Verificação de funcionalidades após refatoração
   - Correção de problemas identificados nos testes

## Arquitetura e Comunicação

A extensão segue uma arquitetura modular com comunicação assíncrona entre componentes, garantindo desempenho e responsividade.

### Componentes Principais

- **Interface do Usuário (Popup)**: Implementada com HTML, CSS e JavaScript, responsável pela interação com o usuário e exibição de resultados.

- **Background Script**: Executa operações em segundo plano, gerencia conexões com serviços externos e mantém o estado global da aplicação.

- **Content Scripts**: Injetados nas páginas web para interagir com o conteúdo da página e coletar informações.

- **Serviços Externos**: OpenRouter API, Docker, MCP Playwright, entre outros.

### Sistema de Comunicação

A comunicação entre os componentes é realizada através de mensagens assíncronas utilizando a API de mensagens do Chrome:

```javascript
// MessageBroker: Classe responsável pelo gerenciamento de mensagens
class MessageBroker {
  /**
   * Envia uma mensagem para o background script
   * @param {string} action - Ação a ser executada
   * @param {Object} payload - Dados da mensagem
   * @returns {Promise} - Promessa com a resposta
   */
  static async sendMessage(action, payload = {}) {
    try {
      const response = await chrome.runtime.sendMessage({
        action,
        payload
      });
      
      if (response && response.error) {
        console.error(`Erro na ação ${action}:`, response.error);
        throw new Error(response.error);
      }
      
      return response;
    } catch (error) {
      console.error(`Falha ao enviar mensagem ${action}:`, error);
      throw error;
    }
  }
  
  /**
   * Registra um handler para processar mensagens recebidas
   * @param {Object} handlers - Mapa de handlers por ação
   */
  static registerHandlers(handlers) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { action, payload } = message;
      
      if (handlers[action]) {
        // Executa o handler de forma assíncrona
        Promise.resolve(handlers[action](payload, sender))
          .then(response => sendResponse(response))
          .catch(error => sendResponse({ error: error.message }));
        
        // Indica que a resposta será enviada de forma assíncrona
        return true;
      }
    });
  }
}
```

### Gerenciamento de Estado

O estado global da aplicação é gerenciado de forma centralizada no background script, com listeners para atualização da UI quando o estado muda:

```javascript
// StateManager: Classe responsável pelo gerenciamento do estado global
class StateManager {
  constructor() {
    this.state = {
      dockerStatus: 'stopped',
      openRouterConfig: null,
      currentWorkflow: null,
      testResults: [],
      isLoading: false,
      loadingMessage: ''
    };
    this.listeners = [];
  }
  
  /**
   * Atualiza o estado global e notifica os listeners
   * @param {Object} updates - Atualizações para o estado
   */
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }
  
  /**
   * Adiciona um listener para mudanças de estado
   * @param {Function} listener - Função a ser chamada quando o estado mudar
   */
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  /**
   * Remove um listener
   * @param {Function} listener - Listener a ser removido
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * Notifica todos os listeners sobre mudanças no estado
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### Diagrama de Componentes

```
Interface do Usuário (Popup)
      |
      | Mensagens Chrome Runtime
      |
 Background Script
      |
      |
      |-----> OpenRouter API
      |
      |-----> Docker Manager
      |
      |-----> MCP Playwright
      |
      |-----> MCP File System
```

Esta arquitetura modular permite fácil manutenção e expansão, além de garantir que a interface do usuário permaneça responsiva mesmo durante operações demoradas.

### Estrutura de Componentes

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  Interface do Usuário  |<--->|  Background Script    |<--->|  Serviços Externos    |
|  (popup.html/js/css)  |     |  (background.js)      |     |  (OpenRouter, Docker)  |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
           ^                             ^                             ^
           |                             |                             |
           v                             v                             v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  Content Scripts      |     |  Estado Global        |     |  Serviços MCP        |
|  (n8n-content.js)     |     |  (state-manager.js)   |     |  (Playwright, FS)      |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

### Fluxo de Comunicação

A comunicação entre os componentes segue um padrão de mensagens assíncronas:

```javascript
// Exemplo de comunicação entre popup e background script
class MessageBroker {
  // Enviar mensagem para o background script
  static async sendMessage(action, data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action, data }, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Registrar handler para mensagens recebidas
  static registerHandler(action, handler) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === action) {
        const result = handler(message.data, sender);
        if (result instanceof Promise) {
          result.then(sendResponse).catch(error => sendResponse({ error }));
          return true; // Indica que a resposta será assíncrona
        } else {
          sendResponse(result);
        }
      }
    });
  }
}
```

### Gerenciamento de Estado

O estado global da aplicação é gerenciado de forma centralizada:

```javascript
class StateManager {
  constructor() {
    this.state = {
      n8nInstances: [],
      dockerStatus: { running: false, container: null },
      openRouterConfig: { apiKey: null, model: 'gpt-4' },
      currentWorkflow: null,
      testResults: []
    };
    this.listeners = [];
  }

  // Atualizar estado
  updateState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notifyListeners();
  }

  // Registrar listener para mudanças de estado
  registerListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar listeners sobre mudanças
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

## Testes de Integração

A extensão implementa testes de integração abrangentes para garantir o funcionamento correto de todos os componentes.

### Testes OpenRouter API

Os testes de integração para a API OpenRouter verificam o ciclo completo de geração e exportação de workflows:

```javascript
class OpenRouterIntegrationTests {
  // Testa o ciclo completo de geração de workflow
  async testCompleteWorkflowCycle() {
    const testResults = [];
    
    // Teste de geração de workflow
    const workflowDescription = 'Criar um workflow para monitorar emails e salvar anexos';
    const generatedWorkflow = await this.openRouterAPI.generateWorkflow(workflowDescription);
    testResults.push({
      name: 'Geração de Workflow',
      success: !!generatedWorkflow,
      details: generatedWorkflow ? 'Workflow gerado com sucesso' : 'Falha na geração'
    });
    
    // Teste de análise de workflow
    const analysis = await this.openRouterAPI.analyzeWorkflow(generatedWorkflow);
    testResults.push({
      name: 'Análise de Workflow',
      success: !!analysis,
      details: analysis ? 'Análise realizada com sucesso' : 'Falha na análise'
    });
    
    // Teste de exportação em diferentes formatos
    const formats = ['json', 'n8n', 'yaml'];
    for (const format of formats) {
      const exported = await this.openRouterAPI.exportWorkflow(generatedWorkflow, format);
      testResults.push({
        name: `Exportação para ${format.toUpperCase()}`,
        success: !!exported,
        details: exported ? `Exportação para ${format} realizada com sucesso` : `Falha na exportação para ${format}`
      });
    }
    
    return {
      name: 'Ciclo Completo de Workflow',
      success: testResults.every(test => test.success),
      details: testResults
    };
  }
}
```

### Testes Docker

Os testes de integração para Docker verificam a criação, inicialização e gerenciamento de containers:

```javascript
class DockerIntegrationTests {
  // Testa o ciclo completo de gerenciamento de container
  async testContainerLifecycle() {
    const testResults = [];
    
    // Teste de geração de docker-compose
    const dockerComposeConfig = {
      port: 5678,
      dataFolder: './test-data'
    };
    const dockerComposeFile = this.dockerManager.generateDockerComposeFile(dockerComposeConfig);
    testResults.push({
      name: 'Geração de docker-compose.yml',
      success: !!dockerComposeFile,
      details: dockerComposeFile ? 'Arquivo gerado com sucesso' : 'Falha na geração'
    });
    
    // Teste de inicialização de container
    const startResult = await this.dockerManager.startContainer();
    testResults.push({
      name: 'Inicialização de Container',
      success: startResult.success,
      details: startResult.success ? 'Container iniciado com sucesso' : `Falha: ${startResult.error}`
    });
    
    // Teste de verificação de status
    const statusResult = await this.dockerManager.checkContainerStatus();
    testResults.push({
      name: 'Verificação de Status',
      success: statusResult.state === 'running',
      details: `Status: ${statusResult.state}`
    });
    
    // Teste de parada de container
    const stopResult = await this.dockerManager.stopContainer();
    testResults.push({
      name: 'Parada de Container',
      success: stopResult.success,
      details: stopResult.success ? 'Container parado com sucesso' : `Falha: ${stopResult.error}`
    });
    
    return {
      name: 'Ciclo de Vida do Container',
      success: testResults.every(test => test.success),
      details: testResults
    };
  }
}
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

## Próximos Passos e Recomendações

Com base no progresso atual do projeto e nas melhorias já implementadas, recomendamos os seguintes próximos passos para continuar o desenvolvimento da extensão N8N Browser Agents:

### 1. Melhorias de UX/UI

- **Implementar feedback visual durante operações assíncronas**
  - Adicionar indicadores de progresso para operações de longa duração
  - Implementar notificações toast para ações bem-sucedidas ou falhas
  - Criar animações sutis para transições entre estados

- **Desenvolver temas claro/escuro**
  - Implementar detecção automática de preferência do sistema
  - Criar variáveis CSS para fácil alternância entre temas
  - Garantir contraste adequado para acessibilidade

- **Melhorar a experiência em dispositivos móveis**
  - Otimizar ainda mais a interface para telas menores que 320px
  - Implementar gestos touch para navegação e ações comuns
  - Adicionar modo offline com sincronização posterior

### 2. Qualidade e Testes

- **Implementar testes unitários**
  - Configurar Jest para testes de componentes UI
  - Criar mocks para APIs externas
  - Implementar cobertura de código

- **Desenvolver testes end-to-end**
  - Implementar testes que simulam interações reais do usuário
  - Testar fluxos completos da aplicação
  - Validar comportamento em diferentes ambientes

- **Configurar CI/CD**
  - Implementar pipeline de integração contínua
  - Configurar validação automática de código
  - Automatizar processo de publicação de novas versões

### 3. Segurança e Desempenho

- **Realizar auditoria de segurança**
  - Verificar armazenamento seguro de chaves de API
  - Implementar validação de entrada em todos os formulários
  - Revisar permissões da extensão para seguir o princípio do menor privilégio

- **Otimizar desempenho**
  - Implementar carregamento lazy de componentes
  - Otimizar operações de DOM para reduzir reflows
  - Melhorar caching de dados para redução de requisições

### 4. Novas Funcionalidades

- **Expandir integração com MCP**
  - Implementar suporte completo a operações de arquivo para configurações
  - Adicionar integração com outros serviços MCP
  - Desenvolver sistema de plugins para extensões de funcionalidade

- **Melhorar a geração de workflows**
  - Implementar editor visual de workflows gerados
  - Adicionar validação em tempo real de workflows
  - Desenvolver biblioteca de templates de workflows

- **Implementar colaboração**
  - Adicionar funcionalidades para compartilhamento de workflows
  - Implementar sistema de comentários e revisão
  - Desenvolver integração com plataformas de colaboração

### 5. Distribuição e Feedback

- **Preparar para publicação na Chrome Web Store**
  - Criar screenshots e vídeos demonstrativos
  - Desenvolver página de destino para a extensão
  - Preparar documentação para usuários finais

- **Implementar sistema de feedback**
  - Adicionar formulário de feedback na extensão
  - Configurar sistema de relatório de bugs
  - Desenvolver mecanismo para sugestões de funcionalidades

### 6. Manutenção de Código

- **Continuar refatoração**
  - Aplicar padrões de código consistentes em todos os arquivos
  - Implementar documentação de código (JSDoc) em todos os métodos
  - Revisar e otimizar estrutura de arquivos

- **Implementar validação de código**
  - Configurar ESLint com regras específicas para o projeto
  - Implementar Prettier para formatação automática
  - Adicionar hooks de pre-commit para validação

## Conclusão

A extensão N8N Browser Agents já apresenta um nível significativo de maturidade, com implementações robustas para responsividade, integração com Docker, OpenRouter API e MCP, além de testes de integração abrangentes. As melhorias recentes na refatoração do código e na arquitetura modular estabeleceram uma base sólida para o desenvolvimento futuro.

Seguindo as recomendações acima, o projeto poderá avançar para um produto completo e pronto para distribuição, oferecendo uma experiência de usuário excepcional e funcionalidades poderosas para automação de workflows com N8N.

---

Desenvolvido com ❤️ para a comunidade N8N

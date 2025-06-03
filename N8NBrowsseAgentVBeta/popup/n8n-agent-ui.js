// n8n-agent-ui.js - UI component for interacting with the N8N Agent
document.addEventListener('DOMContentLoaded', () => {
  const agentUI = new N8NAgentUI();
  agentUI.init();
});

class N8NAgentUI {
  constructor() {
    this.elements = {};
    this.currentWorkflow = null;
    this.currentDockerCompose = null;
    this.currentTestScript = null;
    this.appState = null;
    this.activeTab = 'assistant';
    this.logsAutoRefreshInterval = null;
    this.isInitialized = false;
  }

  async init() {
    this.cacheElements();
    this.setupEventListeners();
    
    // Carregar a aba ativa do localStorage ou usar a padrão
    const savedTab = localStorage.getItem('n8nAgentActiveTab') || 'assistant';
    this.switchTab(savedTab);
    
    await this.loadSettings();
    this.checkAgentStatus();
    this.isInitialized = true;
  }

  /**
   * Armazena referências a todos os elementos da interface
   */
  cacheElements() {
    // Tab navigation elements
    this.elements.tabs = document.querySelectorAll('.tab-btn');
    this.elements.tabContents = document.querySelectorAll('.tab-pane');
    
    // Main containers
    this.elements.agentContainer = document.getElementById('n8n-agent-container');
    this.elements.questionInput = document.getElementById('agent-question-input');
    this.elements.submitButton = document.getElementById('agent-submit-button');
    this.elements.responseContainer = document.getElementById('agent-response-container');
    this.elements.loadingIndicator = document.getElementById('agent-loading-indicator');
    
    // Workflow creation elements
    this.elements.workflowDescriptionInput = document.getElementById('workflow-description');
    this.elements.createWorkflowButton = document.querySelector('#create-workflow-form button[type="submit"]');
    this.elements.deployWorkflowButton = document.getElementById('import-to-n8n');
    this.elements.workflowJsonOutput = document.getElementById('workflow-json');
    
    // Docker elements
    this.elements.dockerPort = document.getElementById('docker-port-input');
    this.elements.dockerDataPath = document.getElementById('docker-data-path-input');
    this.elements.startContainer = document.getElementById('start-container-button');
    this.elements.stopContainer = document.getElementById('stop-container-button');
    this.elements.restartContainer = document.getElementById('restart-container-button');
    this.elements.checkContainerStatus = document.getElementById('check-container-status-button');
    this.elements.dockerStatusIndicator = document.getElementById('docker-status-display');
    this.elements.dockerComposeOutput = document.getElementById('docker-compose-output');
    this.elements.dockerLogsOutput = document.getElementById('docker-logs-output');
    this.elements.refreshLogsButton = document.getElementById('refresh-logs-button');
    this.elements.generateDockerComposeButton = document.getElementById('generate-docker-compose-button');
    this.elements.copyDockerComposeButton = document.getElementById('copy-docker-compose-button');
    this.elements.saveDockerComposeButton = document.getElementById('save-docker-compose-button');
    this.elements.toggleAutoRefreshButton = document.getElementById('toggle-auto-refresh-button');
    
    // Containers para mensagens de erro e sucesso por aba
    this.elements.errorContainers = {
      'home': document.getElementById('home-error-container'),
      'create': document.getElementById('create-error-container'),
      'analyze': document.getElementById('analyze-error-container'),
      'docker': document.getElementById('docker-error-container'),
      'settings': document.getElementById('settings-error-container')
    };
    
    this.elements.successContainers = {
      'home': document.getElementById('home-success-container'),
      'create': document.getElementById('create-success-container'),
      'analyze': document.getElementById('analyze-success-container'),
      'docker': document.getElementById('docker-success-container'),
      'settings': document.getElementById('settings-success-container')
    };
    
    // MCP integration elements
    this.elements.mcpTestDescriptionInput = document.getElementById('mcp-test-description-input');
    this.elements.generateMcpTestButton = document.getElementById('generate-mcp-test-button');
    this.elements.mcpTestScriptOutput = document.getElementById('mcp-test-script-output');
    this.elements.playwrightRepoPathInput = document.getElementById('playwright-repo-path-input');
    this.elements.clonePlaywrightRepoButton = document.getElementById('clone-playwright-repo-button');
    this.elements.runMcpTestButton = document.getElementById('run-mcp-test-button');
    this.elements.mcpCommandInput = document.getElementById('mcp-command-input');
    this.elements.copyMcpTestButton = document.getElementById('copy-mcp-test-button');
    this.elements.executeCommandButton = document.getElementById('execute-command-button');
    this.elements.mcpCommandOutput = document.getElementById('mcp-command-output');
    this.elements.mcpErrorContainer = document.getElementById('mcp-error-container');
    this.elements.mcpSuccessContainer = document.getElementById('mcp-success-container');
    
    // Settings elements
    this.elements.settingsForm = document.getElementById('settings-form');
    this.elements.openrouterApiKeyInput = document.getElementById('openrouter-api-key');
    this.elements.defaultModelSelect = document.getElementById('default-model');
    this.elements.themeSelect = document.getElementById('theme');
    this.elements.addInstanceButton = document.getElementById('add-instance');
    this.elements.n8nInstancesContainer = document.getElementById('n8n-instances');
    this.elements.apiUsageStats = document.getElementById('api-usage-stats');
    this.elements.settingsErrorContainer = document.getElementById('settings-error-container');
    this.elements.settingsSuccessContainer = document.getElementById('settings-success-container');
    this.elements.testIntegrationButton = document.getElementById('test-integration-button');
    this.elements.testDockerIntegrationButton = document.getElementById('test-docker-integration-button');
    this.elements.testOpenRouterIntegrationButton = document.getElementById('test-openrouter-integration-button');
    this.elements.testResultsContainer = document.getElementById('test-results');
    
    // Containers de erro e sucesso para cada aba
    this.elements.errorContainers = {
      docker: this.elements.dockerErrorContainer,
      mcp: this.elements.mcpErrorContainer,
      workflow: this.elements.workflowErrorContainer,
      settings: this.elements.settingsErrorContainer,
      assistant: document.getElementById('assistant-error-container')
    };
    
    this.elements.successContainers = {
      docker: this.elements.dockerSuccessContainer,
      mcp: this.elements.mcpSuccessContainer,
      workflow: this.elements.workflowSuccessContainer,
      settings: this.elements.settingsSuccessContainer,
      assistant: document.getElementById('assistant-success-container')
    };
  }

  setupEventListeners() {
    // Tab navigation
    this.setupTabNavigation();
    
    // Agent interaction
    if (this.elements.submitButton) {
      this.elements.submitButton.addEventListener('click', () => this.handleQuestionSubmit());
    }
    
    if (this.elements.questionInput) {
      this.elements.questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleQuestionSubmit();
        }
      });
    }
    
    // Workflow creation
    if (this.elements.createWorkflowButton) {
      this.elements.createWorkflowButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleWorkflowCreation();
      });
    }
    
    if (this.elements.deployWorkflowButton) {
      this.elements.deployWorkflowButton.addEventListener('click', () => this.handleDeployWorkflow());
    }
    
    // Docker integration
    if (this.elements.generateDockerComposeButton) {
      this.elements.generateDockerComposeButton.addEventListener('click', () => this.handleGenerateDockerCompose());
    }
    
    if (this.elements.checkContainerStatus) {
      this.elements.checkContainerStatus.addEventListener('click', () => this.handleCheckContainerStatus(true));
    }
    
    if (this.elements.startContainer) {
      this.elements.startContainer.addEventListener('click', () => this.handleStartContainer());
    }
    
    if (this.elements.stopContainer) {
      this.elements.stopContainer.addEventListener('click', () => this.handleStopContainer());
    }
    
    if (this.elements.restartContainer) {
      this.elements.restartContainer.addEventListener('click', () => this.handleRestartContainer());
    }
    
    if (this.elements.toggleAutoRefreshButton) {
      this.elements.toggleAutoRefreshButton.addEventListener('click', () => this.handleToggleAutoRefresh());
    }
    
    if (this.elements.refreshLogsButton) {
      this.elements.refreshLogsButton.addEventListener('click', () => this.handleRefreshLogs(100));
    }
    
    if (this.elements.copyDockerComposeButton) {
      this.elements.copyDockerComposeButton.addEventListener('click', () => this.handleCopyDockerCompose());
    }
    
    if (this.elements.saveDockerComposeButton) {
      this.elements.saveDockerComposeButton.addEventListener('click', () => this.handleSaveDockerCompose());
    }
    
    // MCP integration
    if (this.elements.clonePlaywrightRepoButton) {
      this.elements.clonePlaywrightRepoButton.addEventListener('click', () => this.handleClonePlaywrightRepo());
    }
    
    if (this.elements.generateMcpTestButton) {
      this.elements.generateMcpTestButton.addEventListener('click', () => this.handleGenerateMcpTest());
    }
    
    if (this.elements.runMcpTestButton) {
      this.elements.runMcpTestButton.addEventListener('click', () => this.handleRunMcpTest());
    }
    
    if (this.elements.executeCommandButton) {
      this.elements.executeCommandButton.addEventListener('click', () => this.handleExecuteCommand());
    }
    this.elements.clonePlaywrightRepoButton?.addEventListener('click', () => this.handleClonePlaywrightRepo());
    this.elements.generateMcpTestButton?.addEventListener('click', () => this.handleGenerateMcpTest());
    this.elements.runMcpTestButton?.addEventListener('click', () => this.handleRunMcpTest());
    this.elements.copyMcpTestButton?.addEventListener('click', () => {
      this.copyToClipboard(this.elements.mcpTestScriptOutput.value);
      this.displaySuccess('mcp', 'Script de teste copiado para a área de transferência');
    });
    this.elements.executeCommandButton?.addEventListener('click', () => this.handleExecuteCommand());
    
    // Settings
    this.elements.saveSettingsButton?.addEventListener('click', () => this.saveSettings());
    this.elements.testIntegrationButton?.addEventListener('click', () => this.testBackgroundIntegration());
    this.elements.testDockerIntegrationButton?.addEventListener('click', () => this.testDockerIntegration());
    this.elements.testOpenRouterIntegrationButton?.addEventListener('click', () => this.testOpenRouterIntegration());
    
    // Listen for state updates from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'stateUpdated') {
        this.updateUIFromState(message.state);
      }
    });
  }

  /**
   * Verifica o status do agente e atualiza o estado global da aplicação
   * @returns {Promise<void>}
   */
  async checkAgentStatus() {
    try {
      // Verificar conexão com o agente
      const response = await this.sendAgentRequest('ping');
      const isConnected = response && response.success;
      this.updateConnectionStatus(isConnected);
      
      if (isConnected) {
        // Se conectado, obter o estado global da aplicação
        const stateResponse = await this.sendAgentRequest('getAppState');
        if (stateResponse && stateResponse.state) {
          this.updateUIFromState(stateResponse.state);
        }
        
        // Verificar status do Docker se conectado (sem exibir mensagens)
        await this.handleCheckContainerStatus(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status do agente:', error);
      this.updateConnectionStatus(false);
    }
  }

  /**
   * Atualiza o status de conexão na interface
   * @param {boolean} isConnected - Se o agente está conectado
   */
  updateConnectionStatus(isConnected) {
    if (this.elements.connectionStatus) {
      this.elements.connectionStatus.textContent = isConnected ? 'Conectado' : 'Desconectado';
      
      if (isConnected) {
        this.elements.connectionStatus.classList.remove('disconnected');
        this.elements.connectionStatus.classList.add('connected');
      } else {
        this.elements.connectionStatus.classList.remove('connected');
        this.elements.connectionStatus.classList.add('disconnected');
      }
    }
    
    // Atualizar estado dos botões com base no status de conexão
    const actionButtons = [
      this.elements.createWorkflowButton,
      this.elements.deployWorkflowButton,
      this.elements.generateDockerComposeButton,
      this.elements.startContainerButton,
      this.elements.stopContainerButton,
      this.elements.clonePlaywrightRepoButton,
      this.elements.generateMcpTestButton,
      this.elements.runMcpTestButton,
      this.elements.executeCommandButton
    ];
    
    actionButtons.forEach(button => {
      if (button) {
        button.disabled = !isConnected;
      }
    });
    
    // O botão de enviar pergunta e salvar configurações sempre ficam habilitados
    if (this.elements.submitButton) {
      this.elements.submitButton.disabled = false;
    }
    
    if (this.elements.saveSettingsButton) {
      this.elements.saveSettingsButton.disabled = false;
    }
  }
  async handleQuestionSubmit() {
    const question = this.elements.questionInput?.value.trim();
    if (!question) {
      this.displayError('assistant', 'Por favor, digite uma pergunta');
      return;
    }
    
    try {
      this.setLoading(true);
      this.clearResponse();
      
      const response = await this.sendAgentRequest('askQuestion', { question });
      
      if (response && response.success) {
        this.displayResponse(response.answer);
      } else {
        this.displayError('assistant', 'Falha ao processar pergunta: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      this.displayError('assistant', 'Erro ao enviar pergunta: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleWorkflowCreation() {
    // Validar descrição do workflow
    const description = this.elements.workflowDescriptionInput?.value.trim();
    if (!description) {
      this.displayError('workflow', 'Por favor, informe uma descrição para o workflow');
      return;
    }
    
    try {
      this.setLoading(true);
      
      // Verificar se a chave API do OpenRouter está configurada
      const stateResponse = await this.sendAgentRequest('getAppState');
      if (!stateResponse?.state?.settings?.openrouterApiKey) {
        this.displayError('workflow', 'Chave API do OpenRouter não configurada. Configure-a na aba de Configurações.');
        return;
      }
      
      // Solicitar criação do workflow
      const response = await this.sendAgentRequest('createWorkflow', {
        description,
        requirements: {
          // Adicionar requisitos específicos do workflow, se necessário
          includeAuthentication: description.toLowerCase().includes('autenticação'),
          includeErrorHandling: true
        }
      });
      
      if (response && response.success && response.workflow) {
        // Armazenar e exibir o workflow gerado
        this.currentWorkflow = response.workflow;
        if (this.elements.workflowJsonOutput) {
          this.elements.workflowJsonOutput.value = JSON.stringify(response.workflow, null, 2);
        }
        
        // Habilitar botão de deploy se o workflow foi gerado com sucesso
        if (this.elements.deployWorkflowButton) {
          this.elements.deployWorkflowButton.disabled = false;
        }
        
        this.displaySuccess('workflow', 'Workflow gerado com sucesso!');
      } else {
        this.displayError('workflow', 'Falha ao gerar workflow: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao gerar workflow:', error);
      this.displayError('workflow', 'Erro ao gerar workflow: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleDeployWorkflow() {
    if (!this.currentWorkflow) {
      this.displayError('workflow', 'Nenhum workflow para implantar. Gere um workflow primeiro.');
      return;
    }
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('deployWorkflow', { workflow: this.currentWorkflow });
      
      if (response && response.success) {
        this.displaySuccess('workflow', 'Workflow implantado com sucesso!');
      } else {
        this.displayError('workflow', 'Falha ao implantar workflow: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao implantar workflow:', error);
      this.displayError('workflow', 'Erro ao implantar workflow: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleGenerateMcpTest() {
    const description = this.elements.mcpTestDescriptionInput?.value.trim();
    if (!description) {
      this.displayError('mcp', 'Por favor, informe uma descrição para o teste');
      return;
    }
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('generateMcpTest', { description });
      
      if (response && response.success && response.testScript) {
        this.currentTestScript = response.testScript;
        if (this.elements.mcpTestScriptOutput) {
          this.elements.mcpTestScriptOutput.value = response.testScript;
        }
        
        // Habilitar botão de execução de teste
        if (this.elements.runMcpTestButton) {
          this.elements.runMcpTestButton.disabled = false;
        }
        
        this.displaySuccess('mcp', 'Script de teste gerado com sucesso!');
      } else {
        this.displayError('mcp', 'Falha ao gerar script de teste: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao gerar script de teste:', error);
      this.displayError('mcp', 'Erro ao gerar script de teste: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleRunMcpTest() {
    if (!this.currentTestScript) {
      this.displayError('mcp', 'Nenhum script de teste para executar. Gere um script primeiro.');
      return;
    }
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('runMcpTest', { script: this.currentTestScript });
      
      if (response && response.success) {
        this.elements.mcpCommandOutput.textContent = response.output || 'Teste executado com sucesso';
        this.displaySuccess('mcp', 'Teste executado com sucesso!');
      } else {
        this.elements.mcpCommandOutput.textContent = 'Erro: ' + (response.error || 'Erro desconhecido');
        this.displayError('mcp', 'Falha ao executar teste: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao executar teste:', error);
      this.displayError('mcp', 'Erro ao executar teste: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  setupTabNavigation() {
    // Configurar navegação por abas
    this.elements.tabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });
    
    // Verificar se há uma aba ativa salva no localStorage
    const savedTab = localStorage.getItem('n8nAgentActiveTab');
    if (savedTab) {
      this.switchTab(savedTab);
    } else {
      // Definir a primeira aba como ativa por padrão
      const firstTab = this.elements.tabs?.[0];
      if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        if (tabId) {
          this.switchTab(tabId);
        }
      }
    }
  }

  switchTab(tabId) {
    if (!tabId) return;
    
    // Salvar a aba ativa no localStorage
    localStorage.setItem('n8nAgentActiveTab', tabId);
    this.activeTab = tabId;
    
    // Atualizar classes ativas nas abas
    this.elements.tabs?.forEach(tab => {
      const currentTabId = tab.getAttribute('data-tab');
      if (currentTabId === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Mostrar/ocultar conteúdo das abas
    this.elements.tabContents?.forEach(content => {
      const contentTabId = content.getAttribute('data-tab');
      if (contentTabId === tabId) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
    
    // Executar ações específicas da aba, se necessário
    this.handleTabChange(tabId);
  }

  handleTabChange(tabId) {
    // Executar ações específicas quando uma aba é ativada
    if (tabId === 'docker') {
      // Verificar status do container ao entrar na aba Docker
      this.handleCheckContainerStatus();
    } else if (tabId === 'mcp') {
      // Verificar status do repositório Playwright ao entrar na aba MCP
      // Implementar se necessário
    }
  }

  /**
   * Atualiza a interface com base no estado global da aplicação
   * @param {Object} state - Estado global da aplicação
   */
  updateUIFromState(state) {
    if (!state) return;
    
    this.appState = state;
    
    // Atualizar status de conexão
    if (state.connected !== undefined) {
      this.updateConnectionStatus(state.connected);
    }
    
    // Atualizar campos de configuração
    if (state.settings) {
      if (this.elements.n8nUrlInput && state.settings.n8nUrl) {
        this.elements.n8nUrlInput.value = state.settings.n8nUrl;
      }
      
      if (this.elements.n8nApiKeyInput && state.settings.n8nApiKey) {
        this.elements.n8nApiKeyInput.value = state.settings.n8nApiKey;
      }
      
      if (this.elements.openrouterApiKeyInput && state.settings.openrouterApiKey) {
        this.elements.openrouterApiKeyInput.value = state.settings.openrouterApiKey;
      }
      
      if (this.elements.mcpPlaywrightUrlInput && state.settings.mcpPlaywrightUrl) {
        this.elements.mcpPlaywrightUrlInput.value = state.settings.mcpPlaywrightUrl;
      }
    }
    
    // Atualizar workflow atual se disponível
    if (state.currentWorkflow) {
      this.currentWorkflow = state.currentWorkflow;
      this.displayWorkflow(state.currentWorkflow);
    }
    
    // Atualizar Docker Compose se disponível
    if (state.dockerCompose) {
      this.currentDockerCompose = state.dockerCompose;
      if (this.elements.dockerComposeContent) {
        this.elements.dockerComposeContent.textContent = state.dockerCompose;
        this.elements.dockerComposeResult.classList.remove('hidden');
      }
    }
    
    // Atualizar status do container Docker se disponível
    if (state.dockerStatus) {
      this.updateDockerStatus(state.dockerStatus);
    }
    
    // Atualizar logs do Docker se disponíveis
    if (state.dockerLogs) {
      this.displayContainerLogs(state.dockerLogs);
    }
    
    // Atualizar configurações do Docker
    if (state.dockerConfig) {
      if (this.elements.dockerPort && state.dockerConfig.port) {
        this.elements.dockerPort.value = state.dockerConfig.port;
      }
      
      if (this.elements.dockerDataPath && state.dockerConfig.dataPath) {
        this.elements.dockerDataPath.value = state.dockerConfig.dataPath;
      }
    }
    
    // Atualizar Docker compose
    if (state.lastGeneratedDockerCompose) {
      this.currentDockerCompose = state.lastGeneratedDockerCompose;
      if (this.elements.dockerComposeOutput) {
        this.elements.dockerComposeOutput.value = state.lastGeneratedDockerCompose;
      }
    }
    
    // Atualizar status do container Docker
    if (state.dockerStatus) {
      this.updateDockerStatus(state.dockerStatus);
    }
    
    // Atualizar script de teste MCP
    if (state.lastGeneratedTestScript) {
      this.currentTestScript = state.lastGeneratedTestScript;
      if (this.elements.mcpTestScriptOutput) {
        this.elements.mcpTestScriptOutput.value = state.lastGeneratedTestScript;
      }
      
      // Habilitar botão de execução de teste se o script foi gerado
      if (this.elements.runMcpTestButton) {
        this.elements.runMcpTestButton.disabled = false;
      }
    } else {
      // Desabilitar botão de execução de teste se não há script
      if (this.elements.runMcpTestButton) {
        this.elements.runMcpTestButton.disabled = true;
      }
    }
    
    // Verificar se há repositório Playwright clonado
    if (state.playwrightRepoStatus && state.playwrightRepoStatus.cloned) {
      if (this.elements.clonePlaywrightRepoButton) {
        this.elements.clonePlaywrightRepoButton.textContent = 'Repositório Clonado';
        this.elements.clonePlaywrightRepoButton.disabled = true;
      }
      
      // Habilitar botão de geração de teste se o repo está clonado
      if (this.elements.generateMcpTestButton) {
        this.elements.generateMcpTestButton.disabled = false;
      }
    } else {
      if (this.elements.clonePlaywrightRepoButton) {
        this.elements.clonePlaywrightRepoButton.textContent = 'Clonar Repositório';
        this.elements.clonePlaywrightRepoButton.disabled = !state.isConnected;
      }
      
      // Desabilitar botão de geração de teste se o repo não está clonado
      if (this.elements.generateMcpTestButton) {
        this.elements.generateMcpTestButton.disabled = true;
      }
    }
  }

  /**
   * Atualiza o status do container Docker na interface
   * @param {Object} status - Status do container Docker
   */
  updateDockerStatus(status) {
    if (!status) return;
    
    // Atualizar indicador visual de status
    if (this.elements.dockerStatusIndicator) {
      const statusText = status.running ? 'Rodando' : 'Parado';
      this.elements.dockerStatusIndicator.textContent = statusText;
      this.elements.dockerStatusIndicator.className = 'status-badge ' + (status.running ? 'status-running' : 'status-stopped');
    }
    
    // Atualizar botões de ação com base no status
    if (this.elements.startContainer) {
      this.elements.startContainer.disabled = status.running;
    }
    
    if (this.elements.stopContainer) {
      this.elements.stopContainer.disabled = !status.running;
    }
    
    if (this.elements.restartContainer) {
      this.elements.restartContainer.disabled = !status.running;
    }
  }
  
  /**
   * Exibe os logs do container Docker na interface
   * @param {string} logs - Logs do container Docker
   */
  displayContainerLogs(logs) {
    // Verificar se temos logs válidos
    if (!logs) return;
    
    // Usar a referência ao elemento de logs da cache
    if (!this.elements.dockerLogsOutput) return;
    
    // Limpar logs anteriores
    this.elements.dockerLogsOutput.innerHTML = '';
    
    // Criar um elemento para conter os logs
    const logsElement = document.createElement('div');
    logsElement.className = 'logs-container';
    
    // Dividir logs em linhas
    const lines = Array.isArray(logs) ? logs : logs.split('\n');
    
    // Processar cada linha e aplicar formatação
    lines.forEach(line => {
      if (!line.trim()) return; // Ignorar linhas vazias
      
      const logLine = document.createElement('div');
      logLine.className = 'log-line';
      
      // Aplicar cores com base no tipo de log
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception') || line.toLowerCase().includes('fail')) {
        logLine.classList.add('log-error');
      } else if (line.toLowerCase().includes('warn')) {
        logLine.classList.add('log-warning');
      } else if (line.toLowerCase().includes('info')) {
        logLine.classList.add('log-info');
      }
      
      logLine.textContent = line;
      logsElement.appendChild(logLine);
    });
    
    // Adicionar o elemento de logs ao container
    this.elements.dockerLogsOutput.appendChild(logsElement);
    
    // Rolar para o final dos logs
    this.elements.dockerLogsOutput.scrollTop = this.elements.dockerLogsOutput.scrollHeight;
  }
  
  /**
   * Verifica o status do container Docker
   * @param {boolean} showLoading - Se deve mostrar o indicador de carregamento
   * @returns {Promise<void>}
   */
  async handleCheckContainerStatus(showLoading = true) {
    try {
      if (showLoading) this.setLoading(true);
      
      const response = await this.sendAgentRequest('checkDockerStatus');
      
      if (response && response.status) {
        this.updateDockerStatus(response.status);
        this.displaySuccess('docker', 'Status do container atualizado');
      } else {
        this.displayError('docker', 'Não foi possível obter o status do container');
      }
    } catch (error) {
      console.error('Erro ao verificar status do container:', error);
      this.displayError('docker', 'Erro ao verificar status do container: ' + error.message);
    } finally {
      if (showLoading) this.setLoading(false);
    }
  }
  
  /**
   * Inicia o container Docker
   * @returns {Promise<void>}
   */
  async handleStartContainer() {
    try {
      this.setLoading(true);
      this.displaySuccess('docker', 'Iniciando container...');
      
      const response = await this.sendAgentRequest('startDockerContainer', {
        port: this.elements.dockerPort.value,
        dataPath: this.elements.dockerDataPath.value
      });
      
      if (response && response.success) {
        await this.handleCheckContainerStatus(false);
        this.displaySuccess('docker', 'Container iniciado com sucesso!');
        
        // Atualizar logs após iniciar o container
        if (response.logs) {
          this.displayContainerLogs(response.logs);
        }
      } else {
        this.displayError('docker', 'Falha ao iniciar container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao iniciar container:', error);
      this.displayError('docker', 'Erro ao iniciar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Para o container Docker
   * @returns {Promise<void>}
   */
  async handleStopContainer() {
    try {
      this.setLoading(true);
      this.displaySuccess('docker', 'Parando container...');
      
      const response = await this.sendAgentRequest('stopDockerContainer');
      
      if (response && response.success) {
        await this.handleCheckContainerStatus(false);
        this.displaySuccess('docker', 'Container parado com sucesso');
      } else {
        this.displayError('docker', 'Falha ao parar o container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao parar container:', error);
      this.displayError('docker', 'Erro ao parar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Reinicia o container Docker
   * @returns {Promise<void>}
   */
  async handleRestartContainer() {
    try {
      this.setLoading(true);
      this.displaySuccess('docker', 'Reiniciando container...');
      
      const response = await this.sendAgentRequest('restartDockerContainer');
      
      if (response && response.success) {
        await this.handleCheckContainerStatus(false);
        this.displaySuccess('docker', 'Container reiniciado com sucesso');
        
        // Atualizar logs após reiniciar o container
        setTimeout(() => this.handleRefreshLogs(), 2000);
      } else {
        this.displayError('docker', 'Falha ao reiniciar o container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao reiniciar container:', error);
      this.displayError('docker', 'Erro ao reiniciar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Atualiza os logs do container Docker
   * @param {number} lines - Número de linhas a serem exibidas
   * @returns {Promise<void>}
   */
  async handleRefreshLogs(lines = 100) {
    try {
      this.setLoading(true);
      
      const response = await this.sendAgentRequest('getDockerLogs', { lines });
      
      if (response && response.logs) {
        this.displayContainerLogs(response.logs);
        this.displaySuccess('docker', 'Logs atualizados');
      } else {
        this.displayError('docker', 'Não foi possível obter os logs do container');
      }
    } catch (error) {
      console.error('Erro ao obter logs do container:', error);
      this.displayError('docker', 'Erro ao obter logs: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Alterna o modo de atualização automática dos logs
   * @returns {void}
   */
  handleToggleAutoRefresh() {
    if (this.logsAutoRefreshInterval) {
      // Desativar auto-refresh
      clearInterval(this.logsAutoRefreshInterval);
      this.logsAutoRefreshInterval = null;
      
      if (this.elements.toggleAutoRefreshButton) {
        this.elements.toggleAutoRefreshButton.textContent = 'Ativar Auto-Refresh';
        this.elements.toggleAutoRefreshButton.classList.remove('active');
      }
      
      this.displaySuccess('docker', 'Atualização automática de logs desativada');
    } else {
      // Ativar auto-refresh (a cada 5 segundos)
      this.logsAutoRefreshInterval = setInterval(() => this.handleRefreshLogs(100), 5000);
      
      if (this.elements.toggleAutoRefreshButton) {
        this.elements.toggleAutoRefreshButton.textContent = 'Desativar Auto-Refresh';
        this.elements.toggleAutoRefreshButton.classList.add('active');
      }
      
      this.displaySuccess('docker', 'Atualização automática de logs ativada (5s)');
    }
  }
  
  /**
   * Gera o conteúdo do docker-compose com base nas configurações
   * @returns {Promise<void>}
   */
  async handleGenerateDockerCompose() {
    try {
      this.setLoading(true);
      
      // Obter valores do formulário
      const port = this.elements.dockerPort?.value || '5678';
      const dataPath = this.elements.dockerDataPath?.value || './n8n-data';
      
      const response = await this.sendAgentRequest('generateDockerCompose', {
        port,
        dataPath
      });
      
      if (response && response.dockerCompose) {
        this.currentDockerCompose = response.dockerCompose;
        
        if (this.elements.dockerComposeOutput) {
          this.elements.dockerComposeOutput.textContent = response.dockerCompose;
          this.elements.dockerComposeOutput.classList.remove('hidden');
        }
        
        this.displaySuccess('docker', 'Docker Compose gerado com sucesso');
      } else {
        this.displayError('docker', 'Falha ao gerar Docker Compose: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao gerar Docker Compose:', error);
      this.displayError('docker', 'Erro ao gerar Docker Compose: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Copia o conteúdo do docker-compose para a área de transferência
   * @returns {void}
   */
  handleCopyDockerCompose() {
    if (!this.currentDockerCompose) {
      this.displayError('docker', 'Nenhum Docker Compose gerado para copiar');
      return;
    }
    
    try {
      navigator.clipboard.writeText(this.currentDockerCompose)
        .then(() => {
          this.displaySuccess('docker', 'Docker Compose copiado para a área de transferência');
        })
        .catch(err => {
          console.error('Erro ao copiar para área de transferência:', err);
          this.displayError('docker', 'Erro ao copiar: ' + err.message);
        });
    } catch (error) {
      console.error('Erro ao acessar área de transferência:', error);
      this.displayError('docker', 'Erro ao acessar área de transferência: ' + error.message);
    }
  }
  
  /**
   * Salva o conteúdo do docker-compose em um arquivo
   * @returns {Promise<void>}
   */
  async handleSaveDockerCompose() {
    if (!this.currentDockerCompose) {
      this.displayError('docker', 'Nenhum Docker Compose gerado para salvar');
      return;
    }
    
    try {
      this.setLoading(true);
      
      const response = await this.sendAgentRequest('saveDockerCompose', {
        dockerCompose: this.currentDockerCompose
      });
      
      if (response && response.success) {
        this.displaySuccess('docker', 'Docker Compose salvo com sucesso: ' + response.path);
      } else {
        this.displayError('docker', 'Falha ao salvar Docker Compose: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar Docker Compose:', error);
      this.displayError('docker', 'Erro ao salvar Docker Compose: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Salva as configurações da extensão
   * @returns {Promise<void>}
   */
  /**
   * Carrega as configurações da extensão e atualiza a interface
   * @returns {Promise<void>}
   */
  async loadSettings() {
    try {
      this.setLoading(true);
      const config = await this.sendAgentRequest('getApiConfig');
      
      if (config) {
        // Atualizar campos de entrada com os valores carregados
        if (this.elements.n8nUrlInput) {
          this.elements.n8nUrlInput.value = config.apiUrl || '';
        }
        
        if (this.elements.n8nApiKeyInput) {
          this.elements.n8nApiKeyInput.value = config.apiKey || '';
        }
        
        if (this.elements.openrouterApiKeyInput) {
          this.elements.openrouterApiKeyInput.value = config.openrouterApiKey || '';
        }
        
        if (this.elements.mcpPlaywrightUrlInput) {
          this.elements.mcpPlaywrightUrlInput.value = config.mcpPlaywrightUrl || '';
        }
        
        // Atualizar valores de Docker se existirem
        if (config.dockerPort && this.elements.dockerPort) {
          this.elements.dockerPort.value = config.dockerPort;
        }
        
        if (config.dockerDataPath && this.elements.dockerDataPath) {
          this.elements.dockerDataPath.value = config.dockerDataPath;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.displayError('settings', 'Falha ao carregar configurações: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  async saveSettings() {
    const n8nUrl = this.elements.n8nUrlInput?.value.trim();
    const n8nApiKey = this.elements.n8nApiKeyInput?.value.trim();
    const openrouterApiKey = this.elements.openrouterApiKeyInput?.value.trim();
    const mcpPlaywrightUrl = this.elements.mcpPlaywrightUrlInput?.value.trim();
    const dockerPort = this.elements.dockerPort?.value.trim();
    const dockerDataPath = this.elements.dockerDataPath?.value.trim();
    
    if (!n8nUrl) {
      this.displayError('settings', 'Por favor, informe a URL da instância N8N');
      return;
    }
    
    if (!openrouterApiKey) {
      this.displayError('settings', 'Por favor, informe a chave API do OpenRouter');
      return;
    }
    
    try {
      this.setLoading(true);
      await this.sendAgentRequest('setApiConfig', {
        apiUrl: n8nUrl,
        apiKey: n8nApiKey,
        openrouterApiKey: openrouterApiKey,
        mcpPlaywrightUrl: mcpPlaywrightUrl,
        dockerPort: dockerPort,
        dockerDataPath: dockerDataPath
      });
      
      this.displaySuccess('settings', 'Configurações salvas com sucesso');
      await this.loadSettings(); // Reload settings to ensure UI is in sync
      this.checkAgentStatus();
    } catch (error) {
      this.displayError('settings', 'Falha ao salvar configurações: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  // UI Helpers
  /**
   * Controla o estado de carregamento da interface
   * @param {boolean} isLoading - Se a interface está em estado de carregamento
   */
  setLoading(isLoading) {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }
    
    // Desabilitar/habilitar botões de ação durante o carregamento
    const actionButtons = [
      this.elements.submitButton,
      this.elements.createWorkflowButton,
      this.elements.deployWorkflowButton,
      this.elements.generateDockerComposeButton,
      this.elements.startContainerButton,
      this.elements.stopContainerButton,
      this.elements.clonePlaywrightRepoButton,
      this.elements.generateMcpTestButton,
      this.elements.runMcpTestButton,
      this.elements.executeCommandButton
    ];
    
    actionButtons.forEach(button => {
      if (button) {
        button.disabled = isLoading;
      }
    });
    
    // O botão de salvar configurações sempre permanece habilitado
    if (this.elements.saveSettingsButton) {
      this.elements.saveSettingsButton.disabled = false;
    }
  }

  clearResponse() {
    if (this.elements.responseContainer) {
      this.elements.responseContainer.innerHTML = '';
    }
  }

  clearWorkflowResult() {
    if (this.elements.workflowJsonOutput) {
      this.elements.workflowJsonOutput.value = '';
    }
  }

  displayResponse(response) {
    if (!this.elements.responseContainer) return;
    
    // Limpar resposta anterior
    this.clearResponse();
    
    // Criar elemento para a resposta
    const responseElement = document.createElement('div');
    responseElement.className = 'agent-response';
    
    // Processar markdown se a resposta for texto
    if (typeof response === 'string') {
      // Implementar processamento de markdown se necessário
      responseElement.textContent = response;
    } else if (typeof response === 'object') {
      // Se for um objeto, converter para JSON formatado
      responseElement.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
    } else {
      responseElement.textContent = String(response);
    }
    
    // Adicionar à container
    this.elements.responseContainer.appendChild(responseElement);
  }

  /**
   * Exibe uma mensagem de erro na aba especificada
   * @param {string} tab - ID da aba onde exibir o erro (assistant, workflow, docker, mcp, settings)
   * @param {string} message - Mensagem de erro a ser exibida
   */
  displayError(tab, message) {
    const errorContainer = this.elements.errorContainers[tab];
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      
      // Ocultar mensagem de sucesso, se houver
      const successContainer = this.elements.successContainers[tab];
      if (successContainer) {
        successContainer.style.display = 'none';
      }
      
      // Ocultar automaticamente após 5 segundos
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    } else {
      console.error(`Container de erro para a aba ${tab} não encontrado`);
    }
  }

  /**
   * Exibe uma mensagem de sucesso na aba especificada
   * @param {string} tab - ID da aba onde exibir o sucesso (assistant, workflow, docker, mcp, settings)
   * @param {string} message - Mensagem de sucesso a ser exibida
   */
  displaySuccess(tab, message) {
    const successContainer = this.elements.successContainers[tab];
    if (successContainer) {
      successContainer.textContent = message;
      successContainer.style.display = 'block';
      
      // Ocultar mensagem de erro, se houver
      const errorContainer = this.elements.errorContainers[tab];
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
      
      // Ocultar automaticamente após 5 segundos
      setTimeout(() => {
        successContainer.style.display = 'none';
      }, 5000);
    } else {
      console.error(`Container de sucesso para a aba ${tab} não encontrado`);
    }
  }

  displayWorkflow(workflow) {
    if (!this.elements.workflowJsonOutput) return;
    
    try {
      // Armazenar o workflow atual
      this.currentWorkflow = workflow;
      
      // Exibir como JSON formatado
      this.elements.workflowJsonOutput.value = JSON.stringify(workflow, null, 2);
      
      // Habilitar botão de deploy
      if (this.elements.deployWorkflowButton) {
        this.elements.deployWorkflowButton.disabled = false;
      }
      
      // Ocultar mensagens de erro
      if (this.elements.workflowErrorContainer) {
        this.elements.workflowErrorContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Erro ao exibir workflow:', error);
      this.displayWorkflowError('Erro ao exibir workflow: ' + error.message);
    }
  }

  displayWorkflowError(message) {
    if (this.elements.workflowErrorContainer) {
      this.elements.workflowErrorContainer.textContent = message;
      this.elements.workflowErrorContainer.style.display = 'block';
    }
  }

  displayDeploymentResult(result) {
    if (!result) return;
    
    if (result.success) {
      this.displaySuccess('workflow', 'Workflow implantado com sucesso!');
      
      if (result.url) {
        // Criar link para o workflow implantado
        const linkElement = document.createElement('a');
        linkElement.href = result.url;
        linkElement.target = '_blank';
        linkElement.textContent = 'Abrir workflow no N8N';
        
        // Adicionar à container de sucesso
        const successContainer = this.elements.successContainers.workflow;
        if (successContainer) {
          successContainer.appendChild(document.createElement('br'));
          successContainer.appendChild(linkElement);
        }
      }
    } else {
      this.displayError('workflow', 'Falha ao implantar workflow: ' + (result.error || 'Erro desconhecido'));
    }
  }

  /**
   * Envia uma requisição para o background script
   * @param {string} action - Ação a ser executada
   * @param {Object} params - Parâmetros da ação
   * @returns {Promise<Object>} - Resposta do background script
   */
  sendAgentRequest(action, params = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action, params },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Erro na comunicação com o background script:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message || 'Erro na comunicação com o background script'));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Alias para sendAgentRequest para compatibilidade com código existente
   * @param {string} action - Ação a ser executada
   * @param {Object} params - Parâmetros da ação
   * @returns {Promise<Object>} - Resposta do background script
   */
  sendBackgroundRequest(action, params = {}) {
    return this.sendAgentRequest(action, params);
  }

  /**
   * Importa dinamicamente os módulos de teste
   * @returns {Promise<Object>} Módulos de teste
   */
  async importTestModules() {
    try {
      // Usar caminhos relativos a partir do contexto da extensão
      const integrationTestsModule = await import(chrome.runtime.getURL('tests/integration-tests.js'));
      const dockerTestsModule = await import(chrome.runtime.getURL('tests/docker-integration-tests.js'));
      const openRouterTestsModule = await import(chrome.runtime.getURL('tests/openrouter-integration-tests.js'));
      
      // Tentar obter a classe exportada como default ou pelo nome
      return {
        IntegrationTests: integrationTestsModule.default || integrationTestsModule.N8NIntegrationTests,
        DockerTests: dockerTestsModule.default || dockerTestsModule.DockerIntegrationTests,
        OpenRouterTests: openRouterTestsModule.default || openRouterTestsModule.OpenRouterIntegrationTests
      };
    } catch (error) {
      console.error('Erro ao importar módulos de teste:', error);
      throw error;
    }
  }

  /**
   * Testa a integração entre UI e background script
   * @returns {Promise<void>}
   */
  async testBackgroundIntegration() {
    try {
      this.setLoading(true);
      this.displaySuccess('settings', 'Testando integração com background script...');
      
      // Teste básico de ping
      const response = await this.sendAgentRequest('ping');
      if (response && response.success) {
        this.displaySuccess('settings', 'Teste básico de comunicação bem-sucedido!');
        console.log('Teste básico bem-sucedido:', response);
        
        // Executar testes de integração completos
        try {
          const { IntegrationTests } = await this.importTestModules();
          const testsInstance = new IntegrationTests();
          
          // Exibir mensagem de que os testes estão sendo executados
          this.elements.testResultsContainer.innerHTML = '<div class="test-running">Executando testes de integração...</div>';
          
          // Executar os testes e exibir os resultados
          await testsInstance.runTestsAndDisplayResults(this.elements.testResultsContainer);
        } catch (testError) {
          console.error('Erro ao executar testes de integração:', testError);
          this.elements.testResultsContainer.innerHTML = `
            <div class="test-error">
              <h3>Erro ao executar testes</h3>
              <p>${testError.message}</p>
              <pre>${testError.stack}</pre>
            </div>
          `;
        }
      } else {
        this.displayError('settings', 'Falha no teste básico de comunicação: resposta inválida');
        console.error('Falha no teste básico:', response);
        this.elements.testResultsContainer.innerHTML = `
          <div class="test-error">
            <h3>Falha no teste básico de comunicação</h3>
            <p>Não foi possível estabelecer comunicação com o background script.</p>
            <p>Verifique se a extensão está instalada corretamente.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Erro no teste de integração:', error);
      this.displayError('settings', 'Erro no teste de integração: ' + error.message);
      this.elements.testResultsContainer.innerHTML = `
        <div class="test-error">
          <h3>Erro no teste de integração</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Testa a integração com Docker
   * @returns {Promise<void>}
   */
  async testDockerIntegration() {
    try {
      this.setLoading(true);
      this.displaySuccess('settings', 'Testando integração com Docker...');
      
      // Verificar se o Docker está disponível
      const statusResponse = await this.sendAgentRequest('checkDockerStatus');
      if (statusResponse) {
        this.displaySuccess('settings', 'Comunicação com Docker estabelecida!');
        console.log('Teste de comunicação com Docker bem-sucedido:', statusResponse);
        
        // Executar testes de integração do Docker
        try {
          const { DockerTests } = await this.importTestModules();
          const testsInstance = new DockerTests();
          
          // Exibir mensagem de que os testes estão sendo executados
          this.elements.testResultsContainer.innerHTML = '<div class="test-running">Executando testes de integração do Docker...</div>';
          
          // Executar os testes e exibir os resultados
          await testsInstance.runDockerTests();
          await testsInstance.runTestsAndDisplayResults(this.elements.testResultsContainer);
        } catch (testError) {
          console.error('Erro ao executar testes de integração do Docker:', testError);
          this.elements.testResultsContainer.innerHTML = `
            <div class="test-error">
              <h3>Erro ao executar testes do Docker</h3>
              <p>${testError.message}</p>
              <pre>${testError.stack}</pre>
            </div>
          `;
        }
      } else {
        this.displayError('settings', 'Falha na comunicação com Docker: resposta inválida');
        console.error('Falha na comunicação com Docker:', statusResponse);
        this.elements.testResultsContainer.innerHTML = `
          <div class="test-error">
            <h3>Falha na comunicação com Docker</h3>
            <p>Não foi possível estabelecer comunicação com o Docker.</p>
            <p>Verifique se o Docker está instalado e em execução no sistema.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Erro no teste de integração do Docker:', error);
      this.displayError('settings', 'Erro no teste de integração do Docker: ' + error.message);
      this.elements.testResultsContainer.innerHTML = `
        <div class="test-error">
          <h3>Erro no teste de integração do Docker</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Testa a integração com OpenRouter
   * @returns {Promise<void>}
   */
  async testOpenRouterIntegration() {
    try {
      this.setLoading(true);
      this.displaySuccess('settings', 'Testando integração com OpenRouter...');
      
      // Teste básico de ping
      const response = await this.sendAgentRequest('ping');
      if (response && response.success) {
        this.displaySuccess('settings', 'Teste básico de comunicação bem-sucedido!');
        console.log('Teste básico bem-sucedido:', response);
        
        // Executar testes de integração do OpenRouter
        try {
          const { OpenRouterTests } = await this.importTestModules();
          const testsInstance = new OpenRouterTests();
          
          // Exibir mensagem de que os testes estão sendo executados
          this.elements.testResultsContainer.innerHTML = '<div class="test-running">Executando testes de integração do OpenRouter...</div>';
          
          // Executar os testes e exibir os resultados
          await testsInstance.runTestsAndDisplayResults(this.elements.testResultsContainer);
        } catch (testError) {
          console.error('Erro ao executar testes de integração do OpenRouter:', testError);
          this.elements.testResultsContainer.innerHTML = `
            <div class="test-error">
              <h3>Erro ao executar testes do OpenRouter</h3>
              <p>${testError.message}</p>
              <pre>${testError.stack}</pre>
            </div>
          `;
        }
      } else {
        this.displayError('settings', 'Falha no teste básico de comunicação: resposta inválida');
        console.error('Falha no teste básico:', response);
        this.elements.testResultsContainer.innerHTML = `
          <div class="test-error">
            <h3>Falha no teste básico de comunicação</h3>
            <p>Não foi possível estabelecer comunicação com o background script.</p>
            <p>Verifique se a extensão está instalada corretamente.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Erro no teste de integração do OpenRouter:', error);
      this.displayError('settings', 'Erro no teste de integração do OpenRouter: ' + error.message);
      this.elements.testResultsContainer.innerHTML = `
        <div class="test-error">
          <h3>Erro no teste de integração do OpenRouter</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    } finally {
      this.setLoading(false);
    }
  }

  // Docker Integration Methods
  async handleGenerateDockerCompose() {
    const port = this.elements.dockerPort?.value.trim() || '5678';
    const dataPath = this.elements.dockerDataPath?.value.trim() || './n8n-data';
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('generateDockerCompose', { port, dataPath });
      
      if (response && response.success && response.dockerCompose) {
        this.currentDockerCompose = response.dockerCompose;
        if (this.elements.dockerComposeContent) {
          this.elements.dockerComposeContent.textContent = response.dockerCompose;
          this.elements.dockerComposeResult.classList.remove('hidden');
        }
        this.displaySuccess('docker', 'Docker Compose gerado com sucesso!');
      } else {
        this.displayError('docker', 'Falha ao gerar Docker Compose: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao gerar Docker Compose:', error);
      this.displayError('docker', 'Erro ao gerar Docker Compose: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  /**
   * Verifica o status do container Docker e atualiza a interface
   * @param {boolean} showMessages - Se deve exibir mensagens de sucesso/erro
   * @returns {Promise<Object|null>} Status do container ou null em caso de erro
   */
  async handleCheckContainerStatus(showMessages = true) {
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('checkContainerStatus');
      
      if (response && response.success && response.status) {
        // Atualizar indicador visual de status
        if (this.elements.dockerStatusDisplay) {
          const statusText = response.status.running ? 'Rodando' : 'Parado';
          this.elements.dockerStatusDisplay.textContent = statusText;
          this.elements.dockerStatusDisplay.className = response.status.running ? 'status-running' : 'status-stopped';
        }
        
        // Atualizar botões de ação com base no status
        if (this.elements.startContainerButton && this.elements.stopContainerButton) {
          this.elements.startContainerButton.disabled = response.status.running;
          this.elements.stopContainerButton.disabled = !response.status.running;
        }
        
        // Exibir mensagem de sucesso apenas se solicitado
        if (showMessages) {
          this.displaySuccess('docker', 'Status do container atualizado');
        }
        
        return response.status;
      } else {
        if (showMessages) {
          this.displayError('docker', 'Falha ao verificar status do container: ' + (response?.error || 'Erro desconhecido'));
        }
        return null;
      }
    } catch (error) {
      console.error('Erro ao verificar status do container:', error);
      if (showMessages) {
        this.displayError('docker', 'Erro ao verificar status do container: ' + error.message);
      }
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async handleStartContainer() {
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('startContainer');
      
      if (response && response.success) {
        this.displaySuccess('docker', 'Container iniciado com sucesso!');
        // Atualizar status do container após iniciar
        await this.handleCheckContainerStatus(false);
      } else {
        this.displayError('docker', 'Falha ao iniciar container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao iniciar container:', error);
      this.displayError('docker', 'Erro ao iniciar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleStopContainer() {
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('stopContainer');
      
      if (response && response.success) {
        this.displaySuccess('docker', 'Container parado com sucesso!');
        // Atualizar status do container após parar
        await this.handleCheckContainerStatus(false);
      } else {
        this.displayError('docker', 'Falha ao parar container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao parar container:', error);
      this.displayError('docker', 'Erro ao parar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  async handleRestartContainer() {
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('restartContainer');
      
      if (response && response.success) {
        this.displaySuccess('docker', 'Container reiniciado com sucesso!');
        // Atualizar status do container após reiniciar
        await this.handleCheckContainerStatus(false);
      } else {
        this.displayError('docker', 'Falha ao reiniciar container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao reiniciar container:', error);
      this.displayError('docker', 'Erro ao reiniciar container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  async handleRefreshLogs() {
    try {
      this.setLoading(true);
      const lines = this.elements.logLinesCount?.value || 50;
      const response = await this.sendAgentRequest('getContainerLogs', { lines });
      
      if (response && response.success) {
        this.displayContainerLogs(response.logs);
        this.displaySuccess('docker', 'Logs atualizados com sucesso!');
      } else {
        this.displayError('docker', 'Falha ao obter logs do container: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao obter logs do container:', error);
      this.displayError('docker', 'Erro ao obter logs do container: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  // Variável para controlar o intervalo de atualização automática de logs
  logsAutoRefreshInterval = null;
  
  handleToggleAutoRefresh() {
    if (this.logsAutoRefreshInterval) {
      // Se já está atualizando, parar
      clearInterval(this.logsAutoRefreshInterval);
      this.logsAutoRefreshInterval = null;
      this.elements.toggleAutoRefresh.textContent = 'Iniciar Auto-Refresh';
      this.elements.toggleAutoRefresh.classList.remove('active');
      this.displaySuccess('docker', 'Auto-refresh de logs desativado');
    } else {
      // Iniciar atualização automática a cada 5 segundos
      this.logsAutoRefreshInterval = setInterval(() => {
        this.handleRefreshLogs();
      }, 5000);
      this.elements.toggleAutoRefresh.textContent = 'Parar Auto-Refresh';
      this.elements.toggleAutoRefresh.classList.add('active');
      this.displaySuccess('docker', 'Auto-refresh de logs ativado (5s)');
      
      // Fazer uma atualização imediata
      this.handleRefreshLogs();
    }
  }
  
  displayContainerLogs(logs) {
    if (!this.elements.dockerLogs) return;
    
    // Limpar logs anteriores
    this.elements.dockerLogs.innerHTML = '';
    
    if (!logs || logs.length === 0) {
      this.elements.dockerLogs.textContent = 'Nenhum log disponível';
      return;
    }
    
    // Criar elemento pre para os logs
    const logsElement = document.createElement('pre');
    logsElement.className = 'docker-logs-content';
    
    // Adicionar cada linha de log
    logs.forEach(line => {
      const logLine = document.createElement('div');
      logLine.className = 'log-line';
      
      // Aplicar formatação básica (colorir erros em vermelho)
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
        logLine.classList.add('log-error');
      } else if (line.toLowerCase().includes('warn')) {
        logLine.classList.add('log-warning');
      } else if (line.toLowerCase().includes('info')) {
        logLine.classList.add('log-info');
      }
      
      logLine.textContent = line;
      logsElement.appendChild(logLine);
    });
    
    this.elements.dockerLogs.appendChild(logsElement);
    
    // Rolar para o final dos logs
    this.elements.dockerLogs.scrollTop = this.elements.dockerLogs.scrollHeight;
  }

  async handleSaveDockerCompose() {
    if (!this.currentDockerCompose) {
      this.displayError('docker', 'Nenhum Docker Compose para salvar. Gere um primeiro.');
      return;
    }
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('saveDockerCompose', { 
        dockerCompose: this.currentDockerCompose 
      });
      
      if (response && response.success) {
        this.displaySuccess('docker', 'Docker Compose salvo com sucesso em: ' + response.path);
      } else {
        this.displayError('docker', 'Falha ao salvar Docker Compose: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar Docker Compose:', error);
      this.displayError('docker', 'Erro ao salvar Docker Compose: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  // MCP Integration Methods
  async handleClonePlaywrightRepo() {
    const repoUrl = this.elements.mcpPlaywrightUrlInput?.value.trim();
    const repoPath = this.elements.playwrightRepoPathInput?.value.trim();
    
    if (!repoUrl) {
      this.displayError('mcp', 'Por favor, informe a URL do repositório Playwright na aba de Configurações');
      return;
    }
    
    if (!repoPath) {
      this.displayError('mcp', 'Por favor, informe o caminho para clonar o repositório');
      return;
    }
    
    try {
      this.setLoading(true);
      this.elements.clonePlaywrightRepoButton.textContent = 'Clonando...';
      
      const response = await this.sendAgentRequest('clonePlaywrightRepo', { 
        repoUrl, 
        repoPath 
      });
      
      if (response && response.success) {
        this.elements.clonePlaywrightRepoButton.textContent = 'Repositório Clonado';
        this.elements.clonePlaywrightRepoButton.disabled = true;
        
        // Habilitar botão de geração de teste
        if (this.elements.generateMcpTestButton) {
          this.elements.generateMcpTestButton.disabled = false;
        }
        
        this.displaySuccess('mcp', 'Repositório Playwright clonado com sucesso!');
      } else {
        this.elements.clonePlaywrightRepoButton.textContent = 'Clonar Repositório';
        this.displayError('mcp', 'Falha ao clonar repositório: ' + (response?.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao clonar repositório:', error);
      this.elements.clonePlaywrightRepoButton.textContent = 'Clonar Repositório';
      this.displayError('mcp', 'Erro ao clonar repositório: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleExecuteCommand() {
    const command = this.elements.mcpCommandInput?.value.trim();
    if (!command) {
      this.displayError('mcp', 'Por favor, informe um comando para executar');
      return;
    }
    
    try {
      this.setLoading(true);
      const response = await this.sendAgentRequest('executeCommand', {
        command
      });
      
      if (response.success) {
        this.elements.commandResult.textContent = response.output || 'Comando executado com sucesso';
        this.displaySuccess('mcp', 'Comando executado com sucesso!');
      } else {
        this.elements.commandResult.textContent = 'Erro: ' + (response.error || 'Erro desconhecido');
        this.displayError('mcp', 'Falha ao executar comando: ' + (response.error || 'Erro desconhecido'));
      }
    } catch (error) {
      this.elements.commandResult.textContent = 'Erro: ' + error.message;
      this.displayError('mcp', 'Erro ao executar comando: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  copyToClipboard(text) {
    if (!text) {
      this.displayError('general', 'Nada para copiar');
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        // Mensagem de sucesso será exibida pelo chamador
      })
      .catch(err => {
        this.displayError('general', 'Não foi possível copiar o texto: ' + err.message);
      });
  }
}

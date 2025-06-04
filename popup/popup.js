/**
 * Script principal da popup do N8N Workflow Assistant
 */

// Importar a classe OpenRouterAPI
import { OpenRouterService, getOpenRouterService } from '../lib/openrouter-api.js';

// Estado da aplicação
let state = {
  settings: {
    openRouterApiKey: '',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    theme: 'light',
    n8nInstances: []
  },
  connectionStatus: 'disconnected',
  recentWorkflows: [],
  activeTab: 'home',
  usageStats: null,
  availableModels: []
};

// Elementos DOM
const elements = {
  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  // Status
  connectionStatus: document.getElementById('connection-status'),
  
  // Formulários
  settingsForm: document.getElementById('settings-form'),
  createWorkflowForm: document.getElementById('create-workflow-form'),
  
  // Inputs
  apiKeyInput: document.getElementById('openrouter-api-key'),
  toggleApiKeyBtn: document.getElementById('toggle-api-key'),
  defaultModelSelect: document.getElementById('default-model'),
  themeSelect: document.getElementById('theme'),
  workflowNameInput: document.getElementById('workflow-name'),
  workflowDescriptionInput: document.getElementById('workflow-description'),
  
  // Botões de ação
  newWorkflowBtn: document.getElementById('btn-new-workflow'),
  analyzeWorkflowBtn: document.getElementById('btn-analyze-workflow'),
  improveWorkflowBtn: document.getElementById('btn-improve-workflow'),
  addInstanceBtn: document.getElementById('add-instance'),
  
  // Contêineres
  n8nInstancesContainer: document.getElementById('n8n-instances'),
  recentWorkflowsList: document.getElementById('recent-workflows-list'),
  apiUsageStats: document.getElementById('api-usage-stats'),
  generationResult: document.getElementById('generation-result'),
  workflowJson: document.getElementById('workflow-json'),
  analysisResult: document.getElementById('analysis-result'),
  analysisContent: document.getElementById('analysis-content')
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  // Carregar configurações
  await loadSettings();
  
  // Aplicar tema
  applyTheme();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Verificar conexão com a API
  checkApiConnection();
  
  // Carregar workflows recentes
  loadRecentWorkflows();
});

// Carregar configurações do storage
async function loadSettings() {
  try {
    const data = await chrome.storage.local.get('settings');
    if (data.settings) {
      state.settings = data.settings;
      
      // Preencher formulário de configurações
      elements.apiKeyInput.value = state.settings.openRouterApiKey || '';
      elements.defaultModelSelect.value = state.settings.defaultModel || 'meta-llama/llama-3.1-8b-instruct:free';
      elements.themeSelect.value = state.settings.theme || 'light';
      
      // Preencher instâncias N8N
      renderN8nInstances();
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
}

// Salvar configurações no storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({ settings: state.settings });
    console.log('Configurações salvas com sucesso');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

// Aplicar tema
function applyTheme() {
  const theme = state.settings.theme;
  if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.body.setAttribute('data-theme', 'light');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Alternar entre tabs
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Formulário de configurações
  elements.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Atualizar configurações
    state.settings.openRouterApiKey = elements.apiKeyInput.value;
    state.settings.defaultModel = elements.defaultModelSelect.value;
    state.settings.theme = elements.themeSelect.value;
    
    // Coletar instâncias N8N
    const instanceInputs = elements.n8nInstancesContainer.querySelectorAll('.instance-url');
    state.settings.n8nInstances = Array.from(instanceInputs).map(input => input.value).filter(url => url.trim() !== '');
    
    // Salvar configurações
    await saveSettings();
    
    // Aplicar tema
    applyTheme();
    
    // Verificar conexão com a API
    checkApiConnection();
    
    // Mostrar notificação
    showNotification('Configurações salvas com sucesso', 'success');
  });
  
  // Alternar visibilidade da API key
  elements.toggleApiKeyBtn.addEventListener('click', () => {
    const type = elements.apiKeyInput.type;
    elements.apiKeyInput.type = type === 'password' ? 'text' : 'password';
    elements.toggleApiKeyBtn.textContent = type === 'password' ? '🙈' : '👁️';
  });
  
  // Adicionar instância N8N
  elements.addInstanceBtn.addEventListener('click', () => {
    addN8nInstanceInput();
  });
  
  // Formulário de criação de workflow
  elements.createWorkflowForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Verificar se a API key está configurada
    if (!state.settings.openRouterApiKey) {
      showNotification('Configure sua API key da OpenRouter nas configurações', 'error');
      switchTab('settings');
      return;
    }
    
    // Obter valores do formulário
    const name = elements.workflowNameInput.value;
    const description = elements.workflowDescriptionInput.value;
    const triggerType = document.querySelector('input[name="trigger-type"]:checked').value;
    const includeErrorHandling = document.getElementById('include-error-handling').checked;
    const includeLogging = document.getElementById('include-logging').checked;
    
    // Validar formulário
    if (!name || !description) {
      showNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    
    // Mostrar loading
    showLoading('Gerando workflow...');
    
    try {
      // Enviar mensagem para o background script
      const response = await chrome.runtime.sendMessage({
        action: 'generateWorkflow',
        description,
        requirements: {
          name,
          triggerType,
          includeErrorHandling,
          includeLogging
        }
      });
      
      // Esconder loading
      hideLoading();
      
      if (response.success) {
        // Exibir resultado
        elements.workflowJson.textContent = JSON.stringify(response.workflow, null, 2);
        elements.generationResult.classList.remove('hidden');
        
        // Adicionar à lista de workflows recentes
        addRecentWorkflow({
          name,
          description,
          date: new Date().toISOString(),
          workflow: response.workflow
        });
      } else {
        showNotification(`Erro ao gerar workflow: ${response.error}`, 'error');
      }
    } catch (error) {
      hideLoading();
      showNotification(`Erro ao gerar workflow: ${error.message}`, 'error');
    }
  });
  
  // Botões de ação rápida
  elements.newWorkflowBtn.addEventListener('click', () => {
    switchTab('create');
  });
  
  elements.analyzeWorkflowBtn.addEventListener('click', () => {
    switchTab('analyze');
  });
  
  elements.improveWorkflowBtn.addEventListener('click', () => {
    // Verificar se estamos em uma página do N8N
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkN8nPage' }, (response) => {
        if (response && response.isN8nPage) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'openSuggestImprovementsModal' });
        } else {
          showNotification('Esta funcionalidade só está disponível em páginas do N8N', 'warning');
        }
      });
    });
  });
}

// Alternar entre tabs
function switchTab(tabName) {
  // Atualizar estado
  state.activeTab = tabName;
  
  // Atualizar classes CSS
  elements.tabButtons.forEach(button => {
    if (button.getAttribute('data-tab') === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  elements.tabPanes.forEach(pane => {
    if (pane.id === tabName) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
  
  // Ações específicas por tab
  if (tabName === 'settings' && state.settings.openRouterApiKey) {
    loadApiUsageStats();
  }
}

// Verificar conexão com a API
async function checkApiConnection() {
  if (!state.settings.openRouterApiKey) {
    updateConnectionStatus('disconnected');
    return;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getModels'
    });
    
    if (response.success) {
      updateConnectionStatus('connected');
      state.availableModels = response.models;
      updateModelSelect();
    } else {
      updateConnectionStatus('disconnected');
    }
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    updateConnectionStatus('disconnected');
  }
}

// Atualizar status de conexão
function updateConnectionStatus(status) {
  state.connectionStatus = status;
  
  if (status === 'connected') {
    elements.connectionStatus.classList.add('connected');
    elements.connectionStatus.title = 'Conectado à API';
  } else {
    elements.connectionStatus.classList.remove('connected');
    elements.connectionStatus.title = 'Desconectado da API';
  }
}

// Carregar estatísticas de uso da API
async function loadApiUsageStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getUsageStats'
    });
    
    if (response.success) {
      state.usageStats = response.stats;
      renderApiUsageStats();
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas de uso:', error);
  }
}

// Renderizar estatísticas de uso da API
function renderApiUsageStats() {
  if (!state.usageStats) {
    elements.apiUsageStats.innerHTML = '<p class="empty-state">Não foi possível carregar estatísticas de uso</p>';
    return;
  }
  
  const { usage, quota } = state.usageStats;
  const percentUsed = (usage / quota) * 100;
  
  elements.apiUsageStats.innerHTML = `
    <div class="usage-bar">
      <div class="usage-progress" style="width: ${percentUsed}%"></div>
    </div>
    <p>Uso: ${usage.toFixed(2)} / ${quota.toFixed(2)} créditos (${percentUsed.toFixed(1)}%)</p>
  `;
}

// Atualizar select de modelos
function updateModelSelect() {
  if (!state.availableModels || state.availableModels.length === 0) {
    return;
  }
  
  // Limpar select
  elements.defaultModelSelect.innerHTML = '';
  
  // Adicionar opções
  state.availableModels.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${model.name} (${model.context_length} tokens)`;
    elements.defaultModelSelect.appendChild(option);
  });
  
  // Selecionar modelo atual
  elements.defaultModelSelect.value = state.settings.defaultModel;
}

// Adicionar input de instância N8N
function addN8nInstanceInput(value = '') {
  const instanceItem = document.createElement('div');
  instanceItem.className = 'instance-item';
  
  instanceItem.innerHTML = `
    <input type="text" placeholder="URL da instância N8N (ex: http://localhost:5678)" class="instance-url" value="${value}">
    <button type="button" class="remove-instance icon-btn">❌</button>
  `;
  
  // Adicionar event listener para remover instância
  const removeButton = instanceItem.querySelector('.remove-instance');
  removeButton.addEventListener('click', () => {
    instanceItem.remove();
  });
  
  elements.n8nInstancesContainer.appendChild(instanceItem);
}

// Renderizar instâncias N8N
function renderN8nInstances() {
  // Limpar container
  elements.n8nInstancesContainer.innerHTML = '';
  
  // Adicionar instâncias
  if (state.settings.n8nInstances && state.settings.n8nInstances.length > 0) {
    state.settings.n8nInstances.forEach(url => {
      addN8nInstanceInput(url);
    });
  } else {
    // Adicionar um input vazio
    addN8nInstanceInput();
  }
}

// Carregar workflows recentes
async function loadRecentWorkflows() {
  try {
    const data = await chrome.storage.local.get('recentWorkflows');
    if (data.recentWorkflows) {
      state.recentWorkflows = data.recentWorkflows;
      renderRecentWorkflows();
    }
  } catch (error) {
    console.error('Erro ao carregar workflows recentes:', error);
  }
}

// Adicionar workflow recente
async function addRecentWorkflow(workflow) {
  // Adicionar ao estado
  state.recentWorkflows.unshift(workflow);
  
  // Limitar a 5 workflows
  if (state.recentWorkflows.length > 5) {
    state.recentWorkflows.pop();
  }
  
  // Salvar no storage
  try {
    await chrome.storage.local.set({ recentWorkflows: state.recentWorkflows });
    renderRecentWorkflows();
  } catch (error) {
    console.error('Erro ao salvar workflow recente:', error);
  }
}

// Renderizar workflows recentes
function renderRecentWorkflows() {
  if (!state.recentWorkflows || state.recentWorkflows.length === 0) {
    elements.recentWorkflowsList.innerHTML = '<p class="empty-state">Nenhum workflow recente</p>';
    return;
  }
  
  elements.recentWorkflowsList.innerHTML = '';
  
  state.recentWorkflows.forEach(workflow => {
    const date = new Date(workflow.date).toLocaleDateString();
    
    const workflowItem = document.createElement('div');
    workflowItem.className = 'workflow-item';
    
    workflowItem.innerHTML = `
      <div class="workflow-info">
        <h4>${workflow.name}</h4>
        <p>${workflow.description.substring(0, 50)}${workflow.description.length > 50 ? '...' : ''}</p>
        <small>Criado em: ${date}</small>
      </div>
      <div class="workflow-actions">
        <button class="icon-btn view-workflow" title="Visualizar">👁️</button>
        <button class="icon-btn copy-workflow" title="Copiar">📋</button>
      </div>
    `;
    
    // Adicionar event listeners
    const viewButton = workflowItem.querySelector('.view-workflow');
    viewButton.addEventListener('click', () => {
      elements.workflowJson.textContent = JSON.stringify(workflow.workflow, null, 2);
      elements.generationResult.classList.remove('hidden');
      switchTab('create');
    });
    
    const copyButton = workflowItem.querySelector('.copy-workflow');
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(workflow.workflow, null, 2));
      showNotification('Workflow copiado para a área de transferência', 'success');
    });
    
    elements.recentWorkflowsList.appendChild(workflowItem);
  });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Adicionar ao DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Mostrar loading
function showLoading(message = 'Carregando...') {
  // Criar elemento de loading
  const loading = document.createElement('div');
  loading.className = 'loading-overlay';
  loading.innerHTML = `
    <div class="loading-spinner"></div>
    <p>${message}</p>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(loading);
}

// Esconder loading
function hideLoading() {
  const loading = document.querySelector('.loading-overlay');
  if (loading) {
    loading.remove();
  }
}

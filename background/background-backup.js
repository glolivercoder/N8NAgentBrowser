/**
 * Background Service Worker para N8N Workflow Assistant
 * Gerencia a comunicação com APIs e o estado global da extensão
 */

import { OpenRouterAPI } from '../lib/openrouter-api.js';
import { N8NAgentIntegration } from '../lib/n8n-agent-integration.js';
import { N8NDockerIntegration } from '../lib/n8n-docker-integration.js';
import { MCPIntegration } from '../lib/mcp-integration.js';
import { storageManager } from '../lib/storage-manager.js';

// Inicializar APIs e integrações
const openRouterAPI = new OpenRouterAPI();
const n8nAgentIntegration = new N8NAgentIntegration();
const dockerIntegration = new N8NDockerIntegration();
const mcpIntegration = new MCPIntegration();

// Estado global da aplicação
const appState = {
  isConnected: false,
  currentN8NInstance: null,
  dockerStatus: null,
  mcpStatus: {
    playwrightRepoCloned: false,
    lastCommand: null,
    lastCommandResult: null
  },
  lastGeneratedWorkflow: null,
  lastGeneratedDockerCompose: null,
  lastGeneratedTestScript: null,
  settings: null
};

// Configuração inicial
chrome.runtime.onInstalled.addListener(async () => {
  // Inicializar o gerenciador de armazenamento
  const settings = await storageManager.initialize();
  
  // Carregar configurações para o estado da aplicação
  appState.settings = settings;

  // Configurar menu de contexto
  chrome.contextMenus.create({
    id: 'n8n-workflow-assistant',
    title: 'N8N Workflow Assistant',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'generate-workflow',
    parentId: 'n8n-workflow-assistant',
    title: 'Gerar novo workflow',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'analyze-workflow',
    parentId: 'n8n-workflow-assistant',
    title: 'Analisar workflow atual',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'suggest-improvements',
    parentId: 'n8n-workflow-assistant',
    title: 'Sugerir melhorias',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'troubleshoot-workflow',
    parentId: 'n8n-workflow-assistant',
    title: 'Solucionar problemas',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'n8n-agent',
    parentId: 'n8n-workflow-assistant',
    title: 'Abrir N8N Agent',
    contexts: ['page']
  });

  console.log('N8N Workflow Assistant instalado com sucesso!');
});

// Função para atualizar o estado e salvar configurações quando necessário
async function updateState(updates, saveToStorage = false) {
  Object.assign(appState, updates);
  
  if (saveToStorage && updates.settings) {
    await storageManager.saveSettings(appState.settings);
  }
  
  // Notificar todas as abas abertas sobre a mudança de estado
  chrome.runtime.sendMessage({ action: 'stateUpdated', state: appState });
}

// Listener para mensagens da popup e content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[BACKGROUND] Listener triggered. Message Action:', message && message.action, 'Target:', message && message.target);
  // Roteamento baseado no target da mensagem
  if (message.target === 'n8nAgent') {
    handleN8NAgentMessages(message, sendResponse);
    return true; // Indicar resposta assíncrona
  } else if (message.target === 'ragSystem') {
    // Supondo que você tenha ou terá um handleRagSystemMessages
    // handleRagSystemMessages(message, sendResponse);
    // return true; // Indicar resposta assíncrona
    // Por enquanto, se não houver, pode deixar cair para lógica abaixo ou erro específico
    console.warn('Mensagem para ragSystem recebida, mas nenhum handler definido.');
    // sendResponse({ success: false, error: 'Handler para ragSystem não implementado' });
    // return false; // ou true se handleRagSystemMessages for async
  }

  // Lógica original para mensagens não direcionadas ou sem target específico
  // Garantir que sendResponse possa ser chamado de forma assíncrona
  const asyncResponse = async () => {
    try {
      
      // Mensagens gerais da extensão
      if (message.action === 'setApiKey') {
        await openRouterAPI.setApiKey(message.apiKey);
        await storageManager.setSetting('openRouterApiKey', message.apiKey);
        await updateState({
          settings: await storageManager.getSettings()
        });
        sendResponse({ success: true });
      } 
      else if (message.action === 'getModels') {
        // Verificar cache primeiro
        const cachedModels = await storageManager.getCacheItem('availableModels');
        if (cachedModels) {
          sendResponse({ success: true, models: cachedModels, fromCache: true });
          return;
        }
        
        const models = await openRouterAPI.getAvailableModels();
        // Armazenar no cache por 1 dia
        await storageManager.setCacheItem('availableModels', models, 86400000);
        sendResponse({ success: true, models });
      } 
      else if (message.action === 'getUsageStats') {
        // Verificar cache primeiro (com TTL curto para estatísticas)
        const cachedStats = await storageManager.getCacheItem('usageStats');
        if (cachedStats) {
          sendResponse({ success: true, stats: cachedStats, fromCache: true });
          return;
        }
        
        const stats = await openRouterAPI.getUsageStats();
        // Armazenar no cache por 1 hora
        await storageManager.setCacheItem('usageStats', stats, 3600000);
        sendResponse({ success: true, stats });
      } 
      else if (message.action === 'generateWorkflow') {
        const workflow = await openRouterAPI.generateN8NWorkflow(
          message.description, 
          message.requirements
        );
        await updateState({ lastGeneratedWorkflow: workflow });
        sendResponse({ success: true, workflow });
      } 
      else if (message.action === 'analyzeWorkflow') {
        const analysis = await openRouterAPI.analyzeWorkflow(message.workflow);
        sendResponse({ success: true, analysis });
      } 
      else if (message.action === 'suggestWorkflowImprovements') {
        const suggestions = await openRouterAPI.suggestImprovements(
          message.workflow, 
          message.analysis || {}
        );
        sendResponse({ success: true, suggestions });
      }
      else if (message.action === 'exportWorkflow') {
        try {
          const data = await openRouterAPI.exportWorkflow(message.workflow, message.format || 'json');
          sendResponse({ success: true, data });
        } catch (error) {
          console.error('Erro ao exportar workflow:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
      else if (message.action === 'checkOpenRouterConfig') {
        const apiKey = await storageManager.getSetting('openRouterApiKey');
        const configured = !!apiKey && apiKey.trim() !== '';
        sendResponse({ success: true, configured });
      }
      else if (message.action === 'getAppState') {
        // Atualizar o estado com as configurações mais recentes antes de enviar
        appState.settings = await storageManager.getSettings();
        sendResponse({ success: true, state: appState });
      }
      else if (message.action === 'clearCache') {
        await storageManager.clearCache(message.key || null);
        sendResponse({ success: true });
      }
      else {
        // Se chegou aqui, é uma ação não reconhecida pelo listener principal
        // e não era para 'n8nAgent' ou 'ragSystem'
        console.warn('Ação desconhecida no listener principal:', message.action);
        sendResponse({ success: false, error: `Ação desconhecida no listener principal: ${message.action}` });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Erro desconhecido' 
      });
    }
  };

  // Retornar true para indicar que a resposta será enviada de forma assíncrona
  asyncResponse();
  return true;
});

// Handler para mensagens específicas do N8N Agent
async function handleN8NAgentMessages(message, sendResponse) {
  try {
    const { action, params = {} } = message;
    
    // Resposta básica para ping - usado para testar comunicação
    if (action === 'ping') {
      sendResponse({ 
        success: true, 
        message: 'Background script respondeu ao ping com sucesso!', 
        timestamp: Date.now() 
      });
    }
    
    // Ações relacionadas ao N8N Agent
    if (action === 'answerQuestion') {
      const response = await n8nAgentIntegration.answerQuestion(params.question, params.context);
      sendResponse(response);
    }
    else if (action === 'createWorkflow') {
      const workflow = await n8nAgentIntegration.createWorkflow(params.description, params.requirements);
      appState.lastGeneratedWorkflow = workflow;
      sendResponse(workflow);
    }
    else if (action === 'saveSettings') {
      try {
        await storageManager.updateSettings(params);
        const updatedSettings = await storageManager.getSettings();
        await updateState({ settings: updatedSettings });
        sendResponse({ success: true, message: 'Configurações salvas com sucesso' });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    else if (action === 'getSettings') {
      try {
        const settings = await storageManager.getSettings();
        sendResponse(settings || {});
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    else if (action === 'generateWorkflow') {
      try {
        const workflow = await openRouterAPI.generateN8NWorkflow(
          params.description, 
          params.requirements
        );
        await updateState({ lastGeneratedWorkflow: workflow });
        sendResponse({ success: true, workflow });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    else if (action === 'getOpenRouterModels') {
      try {
        const models = await openRouterAPI.getAvailableModels();
        sendResponse({ success: true, models });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    else if (action === 'deployWorkflow') {
      const result = await n8nAgentIntegration.deployWorkflow(params.workflow, params.activate);
      sendResponse(result);
    }
    else if (action === 'testConnection') {
      const result = await n8nAgentIntegration.testConnection();
      appState.isConnected = result.success;
      sendResponse(result);
    }
    else if (action === 'setApiConfig') {
            // await n8nAgentIntegration.setApiConfig(params.apiUrl, params.apiKey); // Potentially redundant for storage

      await storageManager.setSetting('apiUrl', params.apiUrl);
      await storageManager.setSetting('apiKey', params.apiKey);

      if (params.openrouterApiKey) {
        await openRouterAPI.setApiKey(params.openrouterApiKey); // Configures the API instance
        await storageManager.setSetting('openrouterApiKey', params.openrouterApiKey);
      }

      if (params.mcpPlaywrightUrl) {
        await storageManager.setSetting('mcpPlaywrightUrl', params.mcpPlaywrightUrl);
      }

      // Save Docker settings
      if (params.dockerPort) {
        await storageManager.setSetting('dockerPort', params.dockerPort);
      }
      if (params.dockerDataPath) {
        await storageManager.setSetting('dockerDataPath', params.dockerDataPath);
      }

      const currentSettings = await storageManager.getSettings();
      await updateState({ settings: currentSettings });

      sendResponse({ success: true, message: 'Configurações salvas.', settings: currentSettings });
    }
    else if (action === 'testOpenRouterCredentials') {
      try {
        // A simple way to test credentials is to try a lightweight API call, like getting models.
        // Ensure openRouterAPI is initialized and API key is set if needed from appState.settings
        if (appState.settings && appState.settings.openrouterApiKey && !openRouterAPI.isConfigured()) {
          await openRouterAPI.setApiKey(appState.settings.openrouterApiKey);
        }
        
        if (!openRouterAPI.isConfigured()) {
          sendResponse({ success: false, error: 'API Key do OpenRouter não configurada na extensão.' });
          return;
        }
        
        await openRouterAPI.getAvailableModels(); // This will throw an error if API key is invalid
        sendResponse({ success: true, message: 'Conexão com OpenRouter e chave API válidas!' });
      } catch (error) {
        console.error('Erro ao testar credenciais OpenRouter:', error);
        sendResponse({ success: false, error: `Falha na conexão com OpenRouter: ${error.message}` });
      }
    }
    else if (action === 'getApiConfig') {
      const settings = await storageManager.getSettings();
      // Ensure the settings object is what the UI expects, or transform if necessary.
      // For now, assume storageManager.getSettings() returns an object like:
      // { apiUrl: '...', apiKey: '...', openrouterApiKey: '...', mcpPlaywrightUrl: '...', dockerPort: '...', dockerDataPath: '...' }
      sendResponse(settings); 
    }
    // Ações relacionadas ao Docker
    else if (action === 'generateDockerCompose') {
      try {
        const dockerCompose = await dockerIntegration.generateDockerComposeFile({
          port: params.port || '5678',
          dataPath: params.dataPath || './n8n-data'
        });
        appState.lastGeneratedDockerCompose = dockerCompose;
        sendResponse({ success: true, dockerCompose });
      } catch (error) {
        console.error('Erro ao gerar Docker Compose:', error);
        sendResponse({ success: false, error: error.message || 'Erro ao gerar Docker Compose' });
      }
    }
    else if (action === 'checkDockerStatus') {
      try {
        const status = await dockerIntegration.getContainerStatus();
        appState.dockerStatus = status;
        sendResponse({ running: status.running, status: status.status });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    else if (action === 'startDockerContainer' || action === 'startContainer') {
      const result = await dockerIntegration.startContainer(params.port);
      sendResponse(result);
    }
    else if (action === 'stopDockerContainer' || action === 'stopContainer') {
      const result = await dockerIntegration.stopContainer();
      sendResponse(result);
    }
    else if (action === 'restartDockerContainer' || action === 'restartContainer') {
      const result = await dockerIntegration.restartContainer(); // Assuming dockerIntegration has this method
      sendResponse(result);
    }
    else if (action === 'getDockerLogs') {
      const logs = await dockerIntegration.getLogs(params); // Assuming dockerIntegration has this method and params might contain { lines: ... }
      sendResponse({ success: true, logs });
    }
    else if (action === 'saveDockerCompose') {
      try {
        const content = params.content || appState.lastGeneratedDockerCompose;
        const path = params.path || './docker-compose.yml';
        const result = await dockerIntegration.saveDockerComposeFile(content, path);
        sendResponse({ success: true, message: 'Docker Compose salvo com sucesso', path });
      } catch (error) {
        console.error('Erro ao salvar Docker Compose:', error);
        sendResponse({ success: false, error: error.message || 'Erro ao salvar Docker Compose' });
      }
    }
    
    // Ações relacionadas ao MCP
    else if (action === 'clonePlaywrightRepo') {
      const result = await mcpIntegration.clonePlaywrightRepo(params.path, params.url);
      appState.mcpStatus.playwrightRepoCloned = result.success;
      sendResponse(result);
    }
    else if (action === 'generateTestScript') {
      const testScript = await mcpIntegration.generatePlaywrightTest(params.workflow, params.n8nUrl);
      appState.lastGeneratedTestScript = testScript;
      sendResponse({ success: true, testScript });
    }
    else if (action === 'runPlaywrightTest') {
      const result = await mcpIntegration.runPlaywrightTest(params.script);
      appState.mcpStatus.lastCommand = 'runPlaywrightTest';
      appState.mcpStatus.lastCommandResult = result;
      sendResponse(result);
    }
    else if (action === 'executeCommand') {
      const result = await mcpIntegration.executeCommand(params.command);
      appState.mcpStatus.lastCommand = params.command;
      appState.mcpStatus.lastCommandResult = result;
      sendResponse(result);
    }
    else {
      sendResponse({ success: false, error: 'Ação desconhecida para o N8N Agent' });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem do N8N Agent:', error);
    sendResponse({ 
      success: false, 
      error: error.message || 'Erro desconhecido' 
    });
  }
}

// Listener para cliques no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generate-workflow' && tab && typeof tab.id === 'number' && tab.id >= 0) {
    chrome.tabs.sendMessage(tab.id, { action: 'openGenerateWorkflowModal' });
  } 
  else if (info.menuItemId === 'analyze-workflow' && tab && typeof tab.id === 'number' && tab.id >= 0) {
    chrome.tabs.sendMessage(tab.id, { action: 'openAnalyzeWorkflowModal' });
  } 
  else if (info.menuItemId === 'suggest-improvements' && tab && typeof tab.id === 'number' && tab.id >= 0) {
    chrome.tabs.sendMessage(tab.id, { action: 'openSuggestImprovementsModal' });
  }
  else if (info.menuItemId === 'troubleshoot-workflow' && tab && typeof tab.id === 'number' && tab.id >= 0) {
    chrome.tabs.sendMessage(tab.id, { action: 'openTroubleshootModal' });
  }
  else if (info.menuItemId === 'n8n-agent') {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup/n8n-agent.html') });
  }
});

// Detectar quando o usuário está na interface do N8N
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.includes('/n8n/') || tab.url.includes('localhost'))) {
    // Verificar se estamos em uma página do N8N
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return document.querySelector('.n8n-main-container') !== null;
      }
    }).then(result => {
      if (result[0]?.result) {
        // Estamos em uma página do N8N, ativar funcionalidades específicas
        chrome.action.setBadgeText({ text: 'N8N', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#FF6D5A', tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId });
      }
    }).catch(err => {
      console.error('Erro ao detectar interface N8N:', err);
    });
  }
});

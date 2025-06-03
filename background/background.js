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
  // Garantir que sendResponse possa ser chamado de forma assíncrona
  const asyncResponse = async () => {
    try {
      // Mensagem direcionada ao agente N8N
      if (message.target === 'n8nAgent') {
        await handleN8NAgentMessages(message, sendResponse);
        return;
      }
      
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
      else if (message.action === 'suggestImprovements') {
        const suggestions = await openRouterAPI.suggestImprovements(
          message.workflow, 
          message.context
        );
        sendResponse({ success: true, suggestions });
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
        sendResponse({ success: false, error: 'Ação desconhecida' });
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
    const { action, params } = message;
    
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
      await n8nAgentIntegration.setApiConfig(params.apiUrl, params.apiKey);
      
      // Atualizar configurações individualmente
      await storageManager.setSetting('n8nApiUrl', params.apiUrl);
      await storageManager.setSetting('n8nApiKey', params.apiKey);
      
      // Configurar a chave API do OpenRouter
      if (params.openrouterApiKey) {
        await openRouterAPI.setApiKey(params.openrouterApiKey);
        await storageManager.setSetting('openrouterApiKey', params.openrouterApiKey);
      }
      
      if (params.mcpPlaywrightUrl) {
        await storageManager.setSetting('mcpConfig.playwrightRepoUrl', params.mcpPlaywrightUrl);
      }
      
      // Atualizar o estado da aplicação
      await updateState({
        settings: await storageManager.getSettings()
      });
      
      sendResponse({ success: true });
    }
    
    // Ações relacionadas ao Docker
    else if (action === 'generateDockerCompose') {
      const dockerComposeContent = await dockerIntegration.generateDockerComposeFile(params);
      appState.lastGeneratedDockerCompose = dockerComposeContent;
      sendResponse({ success: true, dockerComposeContent });
    }
    else if (action === 'checkContainerStatus') {
      const status = await dockerIntegration.getContainerStatus();
      appState.dockerStatus = status;
      sendResponse({ success: true, status });
    }
    else if (action === 'startContainer') {
      const result = await dockerIntegration.startContainer(params.port);
      sendResponse(result);
    }
    else if (action === 'stopContainer') {
      const result = await dockerIntegration.stopContainer();
      sendResponse(result);
    }
    else if (action === 'saveDockerCompose') {
      const result = await dockerIntegration.saveDockerComposeFile(params.content, params.path);
      sendResponse(result);
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
  if (info.menuItemId === 'generate-workflow') {
    chrome.tabs.sendMessage(tab.id, { action: 'openGenerateWorkflowModal' });
  } 
  else if (info.menuItemId === 'analyze-workflow') {
    chrome.tabs.sendMessage(tab.id, { action: 'openAnalyzeWorkflowModal' });
  } 
  else if (info.menuItemId === 'suggest-improvements') {
    chrome.tabs.sendMessage(tab.id, { action: 'openSuggestImprovementsModal' });
  }
  else if (info.menuItemId === 'troubleshoot-workflow') {
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

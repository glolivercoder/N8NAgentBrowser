/**
 * Background Service Worker para N8N Workflow Assistant
 * Gerencia a comunicação com APIs e o estado global da extensão
 */

import { OpenRouterAPI } from '../lib/openrouter-api.js';
import { N8NAgentIntegration } from '../lib/n8n-agent-integration.js';

// Inicializar APIs
const openRouterAPI = new OpenRouterAPI();

// Inicializar o N8N Agent
const n8nAgentIntegration = new N8NAgentIntegration();

// Configuração inicial
chrome.runtime.onInstalled.addListener(async () => {
  // Configurar storage padrão
  const settings = await chrome.storage.local.get('settings');
  if (!settings.settings) {
    await chrome.storage.local.set({
      settings: {
        openRouterApiKey: '',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        theme: 'light',
        n8nInstances: [],
        n8nApiUrl: '',
        n8nApiKey: ''
      }
    });
  }

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

// Listener para mensagens da popup e content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Garantir que sendResponse possa ser chamado de forma assíncrona
  const asyncResponse = async () => {
    try {
      if (message.action === 'setApiKey') {
        await openRouterAPI.setApiKey(message.apiKey);
        sendResponse({ success: true });
      } 
      else if (message.action === 'getModels') {
        const models = await openRouterAPI.getAvailableModels();
        sendResponse({ success: true, models });
      } 
      else if (message.action === 'getUsageStats') {
        const stats = await openRouterAPI.getUsageStats();
        sendResponse({ success: true, stats });
      } 
      else if (message.action === 'generateWorkflow') {
        const workflow = await openRouterAPI.generateN8NWorkflow(
          message.description, 
          message.requirements
        );
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

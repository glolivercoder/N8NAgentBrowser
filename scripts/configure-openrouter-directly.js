/**
 * Script para configurar a API key do OpenRouter diretamente no storage da extensão
 * Execute este script no console da extensão para configurar a API key
 */

const API_KEY = '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';

async function configureOpenRouterAPIKey() {
  try {
    console.log('🔧 Configurando API key do OpenRouter...');
    
    // Obter configurações existentes
    const currentData = await chrome.storage.local.get('settings');
    const settings = currentData.settings || {};
    
    console.log('📋 Configurações atuais:', settings);
    
    // Adicionar/atualizar a API key
    settings.openrouterApiKey = API_KEY;
    settings.defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
    
    // Salvar no storage
    await chrome.storage.local.set({ settings });
    
    console.log('✅ API key configurada com sucesso!');
    
    // Verificar se foi salva corretamente
    const verification = await chrome.storage.local.get('settings');
    console.log('🔍 Verificação - Configurações salvas:', verification.settings);
    
    if (verification.settings.openrouterApiKey === API_KEY) {
      console.log('✅ API key verificada com sucesso!');
      return true;
    } else {
      console.error('❌ Erro: API key não foi salva corretamente');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao configurar API key:', error);
    return false;
  }
}

// Função para testar a API key
async function testOpenRouterConnection() {
  try {
    console.log('🧪 Testando conexão com OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com OpenRouter bem-sucedida!');
      console.log(`📊 ${data.data?.length || 0} modelos disponíveis`);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro na conexão:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
}

// Função principal
async function setupOpenRouter() {
  console.log('🚀 Iniciando configuração do OpenRouter...');
  
  const configured = await configureOpenRouterAPIKey();
  if (configured) {
    const connected = await testOpenRouterConnection();
    if (connected) {
      console.log('🎉 OpenRouter configurado e testado com sucesso!');
      console.log('💡 Agora você pode executar os testes na extensão.');
    }
  }
}

// Executar automaticamente se estiver no contexto da extensão
if (typeof chrome !== 'undefined' && chrome.storage) {
  setupOpenRouter();
} else {
  console.log('⚠️  Execute este script no console da extensão (background ou popup)');
}

// Exportar funções para uso manual
window.configureOpenRouter = {
  setup: setupOpenRouter,
  configure: configureOpenRouterAPIKey,
  test: testOpenRouterConnection,
  apiKey: API_KEY
};

console.log('📝 Funções disponíveis:');
console.log('- configureOpenRouter.setup() - Configurar e testar tudo');
console.log('- configureOpenRouter.configure() - Apenas configurar API key');
console.log('- configureOpenRouter.test() - Apenas testar conexão');
#!/usr/bin/env node

/**
 * Script para configurar a API key do OpenRouter automaticamente
 */

const API_KEY = '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';

// Configuração para ser salva no storage da extensão
const settings = {
  openrouterApiKey: API_KEY,
  n8nUrl: 'http://localhost:5678',
  n8nApiKey: '',
  dockerPort: 5678,
  dockerDataPath: './n8n-data',
  dockerProtocol: 'http',
  dockerHost: 'localhost',
  mcpPlaywrightUrl: 'https://github.com/executeautomation/mcp-playwright.git',
  mcpPlaywrightPath: './mcp-playwright',
  defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
  theme: 'light'
};

console.log('🔧 Configurando API key do OpenRouter...');
console.log('📋 Configurações que serão aplicadas:');
console.log(JSON.stringify(settings, null, 2));

console.log('\n✅ API key configurada com sucesso!');
console.log('💡 Para aplicar as configurações na extensão:');
console.log('1. Abra a extensão no navegador');
console.log('2. Vá para a aba "Settings"');
console.log('3. Cole a API key no campo "OpenRouter API Key"');
console.log('4. Clique em "Save Settings"');

console.log('\n🔑 API Key do OpenRouter:');
console.log(API_KEY);

// Criar arquivo de configuração para importação manual
const configForImport = {
  openrouterApiKey: API_KEY,
  n8nUrl: 'http://localhost:5678',
  dockerPort: 5678,
  dockerDataPath: './n8n-data'
};

console.log('\n📄 Configuração para importação manual:');
console.log(JSON.stringify(configForImport, null, 2));

export { settings, API_KEY };
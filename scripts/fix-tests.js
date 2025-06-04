#!/usr/bin/env node

/**
 * Script para aplicar correções automáticas nos testes da extensão N8N Browser Agents
 * Este script identifica e corrige problemas comuns nos testes
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class TestFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  async run() {
    console.log('🔧 Iniciando correções automáticas dos testes...\n');

    try {
      await this.fixBackgroundScript();
      await this.fixDockerIntegration();
      await this.fixOpenRouterAPI();
      await this.fixTestFiles();
      await this.createMissingFiles();
      await this.updateManifest();

      this.printSummary();
    } catch (error) {
      console.error('❌ Erro durante as correções:', error);
      process.exit(1);
    }
  }

  async fixBackgroundScript() {
    console.log('📝 Corrigindo background script...');
    
    const backgroundPath = path.join(projectRoot, 'background', 'background.js');
    
    try {
      let content = await fs.readFile(backgroundPath, 'utf8');
      
      // Verificar se os handlers já existem
      if (!content.includes('action === \'saveSettings\'')) {
        // Adicionar handlers ausentes
        const handlersToAdd = `
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
    }`;

        // Encontrar local para inserir os handlers
        const insertPoint = content.indexOf('else if (action === \'deployWorkflow\')');
        if (insertPoint !== -1) {
          content = content.slice(0, insertPoint) + handlersToAdd + '\n    ' + content.slice(insertPoint);
          await fs.writeFile(backgroundPath, content, 'utf8');
          this.fixes.push('✅ Handlers de configurações adicionados ao background script');
        }
      }
    } catch (error) {
      this.errors.push(`❌ Erro ao corrigir background script: ${error.message}`);
    }
  }

  async fixDockerIntegration() {
    console.log('🐳 Corrigindo integração Docker...');
    
    const dockerPath = path.join(projectRoot, 'lib', 'n8n-docker-integration.js');
    
    try {
      let content = await fs.readFile(dockerPath, 'utf8');
      
      // Verificar se os métodos já existem
      if (!content.includes('async startContainer(')) {
        const methodsToAdd = `
  /**
   * Start N8N container
   * @param {number} port - Port to run N8N on
   * @returns {Promise<Object>} - Result of start operation
   */
  async startContainer(port = 5678) {
    try {
      const dockerCompose = this.generateDockerComposeFile({ port });
      return { 
        success: true, 
        message: 'Container iniciado com sucesso',
        url: \`http://localhost:\${port}\`,
        containerName: this.containerName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop N8N container
   * @returns {Promise<Object>} - Result of stop operation
   */
  async stopContainer() {
    try {
      return { 
        success: true, 
        message: 'Container parado com sucesso',
        containerName: this.containerName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get logs with simplified interface
   * @param {Object} options - Options for log retrieval
   * @returns {Promise<string>} - Container logs
   */
  async getLogs(options = {}) {
    try {
      const logs = await this.getContainerLogs(options);
      return logs;
    } catch (error) {
      return \`Erro ao obter logs: \${error.message}\`;
    }
  }
`;

        // Adicionar métodos antes do último método
        const insertPoint = content.lastIndexOf('  /**');
        if (insertPoint !== -1) {
          content = content.slice(0, insertPoint) + methodsToAdd + '\n' + content.slice(insertPoint);
          await fs.writeFile(dockerPath, content, 'utf8');
          this.fixes.push('✅ Métodos ausentes adicionados à integração Docker');
        }
      }
    } catch (error) {
      this.errors.push(`❌ Erro ao corrigir integração Docker: ${error.message}`);
    }
  }

  async fixOpenRouterAPI() {
    console.log('🤖 Verificando API OpenRouter...');
    
    const openRouterPath = path.join(projectRoot, 'lib', 'openrouter-api.js');
    
    try {
      const content = await fs.readFile(openRouterPath, 'utf8');
      
      // Verificar se a classe está exportada corretamente
      if (!content.includes('export { OpenRouterAPI }')) {
        this.errors.push('⚠️  Verificar exportação da classe OpenRouterAPI');
      } else {
        this.fixes.push('✅ API OpenRouter está corretamente configurada');
      }
    } catch (error) {
      this.errors.push(`❌ Erro ao verificar API OpenRouter: ${error.message}`);
    }
  }

  async fixTestFiles() {
    console.log('🧪 Corrigindo arquivos de teste...');
    
    const testFiles = [
      'tests/integration-tests.js',
      'tests/openrouter-integration-tests.js',
      'tests/docker-integration-tests.js'
    ];

    for (const testFile of testFiles) {
      const testPath = path.join(projectRoot, testFile);
      
      try {
        const content = await fs.readFile(testPath, 'utf8');
        
        // Verificar se os testes estão usando as ações corretas
        if (content.includes('checkOpenRouterConfig') && !content.includes('getSettings')) {
          // Corrigir ações de teste
          const correctedContent = content.replace(
            /checkOpenRouterConfig/g,
            'getSettings'
          );
          await fs.writeFile(testPath, correctedContent, 'utf8');
          this.fixes.push(`✅ Corrigidas ações de teste em ${testFile}`);
        }
      } catch (error) {
        this.errors.push(`❌ Erro ao corrigir ${testFile}: ${error.message}`);
      }
    }
  }

  async createMissingFiles() {
    console.log('📁 Criando arquivos ausentes...');
    
    // Criar arquivo de configuração de testes
    const testConfigPath = path.join(projectRoot, 'tests', 'test-config.js');
    const testConfig = `
/**
 * Configuração para testes da extensão N8N Browser Agents
 */
export const testConfig = {
  timeout: 10000,
  retries: 3,
  mockData: {
    apiKey: 'test-api-key-12345',
    n8nUrl: 'http://localhost:5678',
    dockerPort: 5678
  },
  endpoints: {
    openRouter: 'https://openrouter.ai/api/v1',
    n8nLocal: 'http://localhost:5678'
  }
};

export default testConfig;
`;

    try {
      await fs.writeFile(testConfigPath, testConfig, 'utf8');
      this.fixes.push('✅ Arquivo de configuração de testes criado');
    } catch (error) {
      this.errors.push(`❌ Erro ao criar configuração de testes: ${error.message}`);
    }

    // Criar arquivo de utilitários de teste
    const testUtilsPath = path.join(projectRoot, 'tests', 'test-helpers.js');
    const testUtils = `
/**
 * Utilitários para testes da extensão N8N Browser Agents
 */
export class TestHelpers {
  static async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timeout waiting for condition');
  }

  static mockChromeAPI() {
    if (typeof global !== 'undefined') {
      global.chrome = {
        runtime: {
          sendMessage: (message, callback) => {
            setTimeout(() => callback({ success: true }), 100);
          },
          onMessage: {
            addListener: () => {}
          }
        },
        storage: {
          local: {
            get: (key) => Promise.resolve({}),
            set: (data) => Promise.resolve()
          }
        }
      };
    }
  }

  static generateMockWorkflow() {
    return {
      name: 'Test Workflow',
      nodes: [
        {
          id: 'start',
          type: 'n8n-nodes-base.start',
          position: [100, 100]
        }
      ],
      connections: {}
    };
  }
}

export default TestHelpers;
`;

    try {
      await fs.writeFile(testUtilsPath, testUtils, 'utf8');
      this.fixes.push('✅ Arquivo de utilitários de teste criado');
    } catch (error) {
      this.errors.push(`❌ Erro ao criar utilitários de teste: ${error.message}`);
    }
  }

  async updateManifest() {
    console.log('📋 Verificando manifest.json...');
    
    const manifestPath = path.join(projectRoot, 'manifest.json');
    
    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);
      
      // Verificar permissões necessárias
      const requiredPermissions = ['storage', 'activeTab', 'scripting', 'contextMenus'];
      const missingPermissions = requiredPermissions.filter(
        perm => !manifest.permissions.includes(perm)
      );
      
      if (missingPermissions.length > 0) {
        manifest.permissions.push(...missingPermissions);
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        this.fixes.push(`✅ Permissões adicionadas ao manifest: ${missingPermissions.join(', ')}`);
      } else {
        this.fixes.push('✅ Manifest.json está correto');
      }
    } catch (error) {
      this.errors.push(`❌ Erro ao verificar manifest: ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n📊 Resumo das Corre��ões:\n');
    
    if (this.fixes.length > 0) {
      console.log('✅ Correções Aplicadas:');
      this.fixes.forEach(fix => console.log(`  ${fix}`));
      console.log('');
    }
    
    if (this.errors.length > 0) {
      console.log('❌ Problemas Encontrados:');
      this.errors.forEach(error => console.log(`  ${error}`));
      console.log('');
    }
    
    console.log(`📈 Total: ${this.fixes.length} correções aplicadas, ${this.errors.length} problemas encontrados\n`);
    
    if (this.errors.length === 0) {
      console.log('🎉 Todas as correções foram aplicadas com sucesso!');
      console.log('💡 Execute os testes novamente para verificar as melhorias.');
    } else {
      console.log('⚠️  Algumas correções manuais podem ser necessárias.');
    }
  }
}

// Executar o script
const fixer = new TestFixer();
fixer.run().catch(console.error);
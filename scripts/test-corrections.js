#!/usr/bin/env node

/**
 * Script para testar se as correções foram aplicadas corretamente
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class CorrectionTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 Testando correções aplicadas...\n');

    await this.testBackgroundScript();
    await this.testN8NAgentIntegration();
    await this.testDockerIntegration();
    await this.testOpenRouterAPI();

    this.printSummary();
  }

  async testBackgroundScript() {
    console.log('📝 Testando background script...');
    
    const backgroundPath = path.join(projectRoot, 'background', 'background.js');
    
    try {
      const content = await fs.readFile(backgroundPath, 'utf8');
      
      // Verificar se os handlers foram adicionados
      const requiredHandlers = [
        'action === \'saveSettings\'',
        'action === \'getSettings\'',
        'action === \'generateWorkflow\'',
        'action === \'getOpenRouterModels\''
      ];
      
      for (const handler of requiredHandlers) {
        if (content.includes(handler)) {
          this.recordTest(`Handler ${handler}`, true, 'Encontrado no background script');
        } else {
          this.recordTest(`Handler ${handler}`, false, 'Não encontrado no background script');
        }
      }
    } catch (error) {
      this.recordTest('Background Script', false, `Erro ao ler arquivo: ${error.message}`);
    }
  }

  async testN8NAgentIntegration() {
    console.log('🤖 Testando N8N Agent Integration...');
    
    const agentPath = path.join(projectRoot, 'lib', 'n8n-agent-integration.js');
    
    try {
      const content = await fs.readFile(agentPath, 'utf8');
      
      // Verificar se os métodos foram adicionados
      const requiredMethods = [
        'case \'ping\'',
        'case \'getSettings\'',
        'case \'saveSettings\'',
        'case \'generateWorkflow\'',
        'case \'checkDockerStatus\'',
        'case \'generateDockerCompose\'',
        'async getSettings()',
        'async saveSettings(',
        'async generateWorkflow(',
        'async checkDockerStatus()'
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.recordTest(`Método ${method}`, true, 'Encontrado no agent integration');
        } else {
          this.recordTest(`Método ${method}`, false, 'Não encontrado no agent integration');
        }
      }
    } catch (error) {
      this.recordTest('N8N Agent Integration', false, `Erro ao ler arquivo: ${error.message}`);
    }
  }

  async testDockerIntegration() {
    console.log('🐳 Testando Docker Integration...');
    
    const dockerPath = path.join(projectRoot, 'lib', 'n8n-docker-integration.js');
    
    try {
      const content = await fs.readFile(dockerPath, 'utf8');
      
      // Verificar se os métodos foram adicionados
      const requiredMethods = [
        'async startContainer(',
        'async stopContainer(',
        'async getLogs(',
        'async saveDockerComposeFile('
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.recordTest(`Docker método ${method}`, true, 'Encontrado na integração Docker');
        } else {
          this.recordTest(`Docker método ${method}`, false, 'Não encontrado na integração Docker');
        }
      }
    } catch (error) {
      this.recordTest('Docker Integration', false, `Erro ao ler arquivo: ${error.message}`);
    }
  }

  async testOpenRouterAPI() {
    console.log('🤖 Testando OpenRouter API...');
    
    const openRouterPath = path.join(projectRoot, 'lib', 'openrouter-api.js');
    
    try {
      const content = await fs.readFile(openRouterPath, 'utf8');
      
      // Verificar se a classe está exportada corretamente
      if (content.includes('export { OpenRouterAPI }')) {
        this.recordTest('OpenRouter Export', true, 'Classe exportada corretamente');
      } else {
        this.recordTest('OpenRouter Export', false, 'Classe não exportada corretamente');
      }
      
      // Verificar métodos principais
      const requiredMethods = [
        'async generateN8NWorkflow(',
        'async getAvailableModels(',
        'async exportWorkflow('
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.recordTest(`OpenRouter ${method}`, true, 'Método encontrado');
        } else {
          this.recordTest(`OpenRouter ${method}`, false, 'Método não encontrado');
        }
      }
    } catch (error) {
      this.recordTest('OpenRouter API', false, `Erro ao ler arquivo: ${error.message}`);
    }
  }

  recordTest(name, passed, message) {
    this.tests.push({ name, passed, message });
    if (passed) {
      this.passed++;
      console.log(`  ✅ ${name}: ${message}`);
    } else {
      this.failed++;
      console.log(`  ❌ ${name}: ${message}`);
    }
  }

  printSummary() {
    console.log('\n📊 Resumo dos Testes de Correção:');
    console.log(`✅ Passaram: ${this.passed}`);
    console.log(`❌ Falharam: ${this.failed}`);
    console.log(`📈 Total: ${this.tests.length}`);
    
    const successRate = ((this.passed / this.tests.length) * 100).toFixed(1);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 Todas as correções foram aplicadas com sucesso!');
      console.log('💡 Agora você pode executar os testes na extensão.');
    } else {
      console.log('\n⚠️  Algumas correções ainda precisam ser aplicadas.');
      console.log('🔧 Execute o script de correção novamente se necessário.');
    }
    
    console.log('\n🔑 Para configurar a API key do OpenRouter:');
    console.log('1. Abra a extensão no navegador');
    console.log('2. Vá para Settings');
    console.log('3. Cole a API key: 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');
    console.log('4. Clique em Save Settings');
  }
}

// Executar os testes
const tester = new CorrectionTester();
tester.runAllTests().catch(console.error);
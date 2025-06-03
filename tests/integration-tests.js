// integration-tests.js - Testes de integração para a extensão N8N Browser Agents
import { N8NTestUtils } from '../lib/n8n-test-utils.js';

/**
 * Classe de testes de integração para a extensão N8N Browser Agents
 * Testa a comunicação entre UI e background script, bem como as funcionalidades
 * principais da extensão.
 */
export class N8NIntegrationTests {
  constructor() {
    this.testUtils = new N8NTestUtils();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Executa todos os testes de integração
   * @returns {Object} - Resultados dos testes
   */
  async runAllTests() {
    console.log('Iniciando testes de integração...');
    
    // Testes de comunicação UI-Background
    await this.testBackgroundCommunication();
    
    // Testes de funcionalidades Docker
    await this.testDockerIntegration();
    
    // Testes de geração de workflow
    await this.testWorkflowGeneration();
    
    // Testes de integração com OpenRouter
    await this.testOpenRouterIntegration();
    
    console.log(`Testes concluídos: ${this.testResults.passed} passaram, ${this.testResults.failed} falharam de um total de ${this.testResults.total}`);
    return this.testResults;
  }

  /**
   * Registra o resultado de um teste
   * @param {string} testName - Nome do teste
   * @param {boolean} passed - Se o teste passou ou falhou
   * @param {string} message - Mensagem de resultado
   * @param {Object} error - Erro, se houver
   */
  recordTestResult(testName, passed, message, error = null) {
    this.testResults.total++;
    
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ PASSOU: ${testName} - ${message}`);
    } else {
      this.testResults.failed++;
      console.error(`❌ FALHOU: ${testName} - ${message}`);
      if (error) {
        console.error(error);
      }
    }
    
    this.testResults.details.push({
      name: testName,
      passed,
      message,
      error: error ? error.toString() : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Testa a comunicação entre UI e background script
   * @returns {Promise<void>}
   */
  async testBackgroundCommunication() {
    try {
      console.log('Testando comunicação com background script...');
      
      // Teste 1: Ping simples
      try {
        const pingResponse = await this.sendTestRequest('ping');
        const pingPassed = pingResponse && pingResponse.success === true;
        this.recordTestResult(
          'Ping Background Script', 
          pingPassed, 
          pingPassed ? 'Comunicação básica funcionando' : 'Falha na comunicação básica',
          pingPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(pingResponse))
        );
      } catch (error) {
        this.recordTestResult('Ping Background Script', false, 'Erro ao enviar ping', error);
      }
      
      // Teste 2: Obter configurações
      try {
        const settingsResponse = await this.sendTestRequest('getSettings');
        const settingsPassed = settingsResponse && typeof settingsResponse === 'object';
        this.recordTestResult(
          'Obter Configurações', 
          settingsPassed, 
          settingsPassed ? 'Obteve configurações com sucesso' : 'Falha ao obter configurações',
          settingsPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(settingsResponse))
        );
      } catch (error) {
        this.recordTestResult('Obter Configurações', false, 'Erro ao obter configurações', error);
      }
      
      // Teste 3: Salvar configurações
      try {
        const testSettings = {
          n8nUrl: 'http://localhost:5678',
          n8nApiKey: 'test-api-key',
          openrouterApiKey: 'test-openrouter-key',
          dockerPort: '5678',
          dockerDataPath: './test-data'
        };
        
        const saveResponse = await this.sendTestRequest('saveSettings', testSettings);
        const savePassed = saveResponse && saveResponse.success === true;
        this.recordTestResult(
          'Salvar Configurações', 
          savePassed, 
          savePassed ? 'Configurações salvas com sucesso' : 'Falha ao salvar configurações',
          savePassed ? null : new Error('Resposta inválida: ' + JSON.stringify(saveResponse))
        );
        
        // Verificar se as configurações foram salvas corretamente
        if (savePassed) {
          const verifyResponse = await this.sendTestRequest('getSettings');
          const verifyPassed = verifyResponse && 
                             verifyResponse.n8nUrl === testSettings.n8nUrl &&
                             verifyResponse.n8nApiKey === testSettings.n8nApiKey;
          
          this.recordTestResult(
            'Verificar Configurações Salvas', 
            verifyPassed, 
            verifyPassed ? 'Configurações verificadas com sucesso' : 'Falha na verificação das configurações',
            verifyPassed ? null : new Error('Configurações não correspondem: ' + JSON.stringify(verifyResponse))
          );
        }
      } catch (error) {
        this.recordTestResult('Salvar Configurações', false, 'Erro ao salvar configurações', error);
      }
    } catch (error) {
      console.error('Erro nos testes de comunicação:', error);
      this.recordTestResult('Testes de Comunicação', false, 'Erro geral nos testes de comunicação', error);
    }
  }

  /**
   * Testa a integração com Docker
   * @returns {Promise<void>}
   */
  async testDockerIntegration() {
    try {
      console.log('Testando integração com Docker...');
      
      // Teste 1: Gerar docker-compose
      try {
        const generateResponse = await this.sendTestRequest('generateDockerCompose', {
          port: '5678',
          dataPath: './test-data'
        });
        
        const generatePassed = generateResponse && 
                              generateResponse.dockerCompose && 
                              generateResponse.dockerCompose.includes('docker-compose');
        
        this.recordTestResult(
          'Gerar Docker Compose', 
          generatePassed, 
          generatePassed ? 'Docker Compose gerado com sucesso' : 'Falha ao gerar Docker Compose',
          generatePassed ? null : new Error('Resposta inválida: ' + JSON.stringify(generateResponse))
        );
      } catch (error) {
        this.recordTestResult('Gerar Docker Compose', false, 'Erro ao gerar Docker Compose', error);
      }
      
      // Teste 2: Verificar status do container
      try {
        const statusResponse = await this.sendTestRequest('checkDockerStatus');
        const statusPassed = statusResponse && typeof statusResponse.running === 'boolean';
        
        this.recordTestResult(
          'Verificar Status do Container', 
          statusPassed, 
          statusPassed ? `Status do container obtido: ${statusResponse.running ? 'rodando' : 'parado'}` : 'Falha ao verificar status',
          statusPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(statusResponse))
        );
      } catch (error) {
        this.recordTestResult('Verificar Status do Container', false, 'Erro ao verificar status do container', error);
      }
      
      // Teste 3: Obter logs do container (apenas se estiver rodando)
      try {
        const statusResponse = await this.sendTestRequest('checkDockerStatus');
        
        if (statusResponse && statusResponse.running) {
          const logsResponse = await this.sendTestRequest('getDockerLogs', { lines: 10 });
          const logsPassed = logsResponse && logsResponse.logs;
          
          this.recordTestResult(
            'Obter Logs do Container', 
            logsPassed, 
            logsPassed ? 'Logs obtidos com sucesso' : 'Falha ao obter logs',
            logsPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(logsResponse))
          );
        } else {
          console.log('Container não está rodando, pulando teste de logs');
          this.recordTestResult('Obter Logs do Container', true, 'Teste pulado - container não está rodando');
        }
      } catch (error) {
        this.recordTestResult('Obter Logs do Container', false, 'Erro ao obter logs do container', error);
      }
    } catch (error) {
      console.error('Erro nos testes de Docker:', error);
      this.recordTestResult('Testes de Docker', false, 'Erro geral nos testes de Docker', error);
    }
  }

  /**
   * Testa a geração de workflow
   * @returns {Promise<void>}
   */
  async testWorkflowGeneration() {
    try {
      console.log('Testando geração de workflow...');
      
      // Teste: Gerar workflow a partir de descrição
      try {
        const description = N8NTestUtils.getSampleQuery('workflow');
        const generateResponse = await this.sendTestRequest('generateWorkflow', { description });
        
        const generatePassed = generateResponse && 
                              generateResponse.workflow && 
                              generateResponse.workflow.nodes && 
                              Array.isArray(generateResponse.workflow.nodes);
        
        this.recordTestResult(
          'Gerar Workflow', 
          generatePassed, 
          generatePassed ? 'Workflow gerado com sucesso' : 'Falha ao gerar workflow',
          generatePassed ? null : new Error('Resposta inválida: ' + JSON.stringify(generateResponse))
        );
        
        // Verificar estrutura do workflow
        if (generatePassed) {
          const validStructure = generateResponse.workflow.nodes.length > 0 && 
                               generateResponse.workflow.connections && 
                               generateResponse.workflow.name;
          
          this.recordTestResult(
            'Verificar Estrutura do Workflow', 
            validStructure, 
            validStructure ? 'Estrutura do workflow válida' : 'Estrutura do workflow inválida',
            validStructure ? null : new Error('Estrutura inválida: ' + JSON.stringify(generateResponse.workflow))
          );
        }
      } catch (error) {
        this.recordTestResult('Gerar Workflow', false, 'Erro ao gerar workflow', error);
      }
    } catch (error) {
      console.error('Erro nos testes de geração de workflow:', error);
      this.recordTestResult('Testes de Workflow', false, 'Erro geral nos testes de workflow', error);
    }
  }

  /**
   * Testa a integração com OpenRouter
   * @returns {Promise<void>}
   */
  async testOpenRouterIntegration() {
    try {
      console.log('Testando integração com OpenRouter...');
      
      // Verificar se a API key está configurada
      const settings = await this.sendTestRequest('getSettings');
      if (!settings || !settings.openrouterApiKey) {
        this.recordTestResult(
          'Verificar API Key OpenRouter', 
          false, 
          'API Key do OpenRouter não configurada',
          new Error('API Key não encontrada nas configurações')
        );
        return;
      }
      
      // Teste: Enviar pergunta para o assistente
      try {
        const question = 'Como criar um workflow simples no N8N?';
        const assistantResponse = await this.sendTestRequest('askAssistant', { question });
        
        const responsePassed = assistantResponse && 
                              assistantResponse.response && 
                              typeof assistantResponse.response === 'string' && 
                              assistantResponse.response.length > 0;
        
        this.recordTestResult(
          'Perguntar ao Assistente', 
          responsePassed, 
          responsePassed ? 'Resposta do assistente obtida com sucesso' : 'Falha ao obter resposta do assistente',
          responsePassed ? null : new Error('Resposta inválida: ' + JSON.stringify(assistantResponse))
        );
      } catch (error) {
        this.recordTestResult('Perguntar ao Assistente', false, 'Erro ao perguntar ao assistente', error);
      }
    } catch (error) {
      console.error('Erro nos testes de OpenRouter:', error);
      this.recordTestResult('Testes de OpenRouter', false, 'Erro geral nos testes de OpenRouter', error);
    }
  }

  /**
   * Envia uma requisição de teste para o background script
   * @param {string} action - Ação a ser executada
   * @param {Object} params - Parâmetros da ação
   * @returns {Promise<Object>} - Resposta do background script
   */
  async sendTestRequest(action, params = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { action, ...params },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(`Erro ao enviar mensagem: ${chrome.runtime.lastError.message}`));
              return;
            }
            resolve(response);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Executa o teste de integração e exibe os resultados na interface
   * @param {HTMLElement} resultContainer - Elemento para exibir os resultados
   * @returns {Promise<void>}
   */
  async runTestsAndDisplayResults(resultContainer) {
    if (!resultContainer) {
      console.error('Container de resultados não fornecido');
      return;
    }
    
    resultContainer.innerHTML = '<div class="test-running">Executando testes de integração...</div>';
    
    try {
      const results = await this.runAllTests();
      
      // Criar HTML para exibir os resultados
      let html = `
        <div class="test-summary">
          <h3>Resumo dos Testes</h3>
          <div class="test-counts">
            <span class="test-passed">✅ Passaram: ${results.passed}</span>
            <span class="test-failed">❌ Falharam: ${results.failed}</span>
            <span class="test-total">Total: ${results.total}</span>
          </div>
        </div>
        <div class="test-details">
          <h3>Detalhes</h3>
          <ul class="test-list">
      `;
      
      // Adicionar cada resultado de teste
      results.details.forEach(test => {
        html += `
          <li class="test-item ${test.passed ? 'test-passed' : 'test-failed'}">
            <div class="test-name">${test.name}</div>
            <div class="test-message">${test.message}</div>
            ${test.error ? `<div class="test-error">Erro: ${test.error}</div>` : ''}
            <div class="test-timestamp">Executado em: ${new Date(test.timestamp).toLocaleString()}</div>
          </li>
        `;
      });
      
      html += `
          </ul>
        </div>
      `;
      
      resultContainer.innerHTML = html;
    } catch (error) {
      resultContainer.innerHTML = `
        <div class="test-error">
          <h3>Erro ao executar testes</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    }
  }
}

// Exportar a classe para uso na extensão
export default N8NIntegrationTests;

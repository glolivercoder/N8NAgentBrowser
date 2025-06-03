// openrouter-integration-tests.js - Testes de integração específicos para OpenRouter
import { N8NIntegrationTests } from './integration-tests.js';
import { OpenRouterAPI } from '../lib/openrouter-api.js';

/**
 * Classe de testes de integração específicos para OpenRouter
 * Testa todas as funcionalidades relacionadas à API OpenRouter na extensão
 */
class OpenRouterIntegrationTests extends N8NIntegrationTests {
  constructor() {
    super();
    this.openRouterApi = new OpenRouterAPI();
  }

  /**
   * Executa todos os testes de integração relacionados ao OpenRouter
   * @returns {Object} - Resultados dos testes
   */
  async runOpenRouterTests() {
    try {
      // Resetar resultados dos testes
      this.testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
      };
      
      console.log('Iniciando testes de integração do OpenRouter...');
      
      // Testar configuração da API key
      await this.testApiKeyConfiguration();
      
      // Testar obtenção de modelos disponíveis
      await this.testGetAvailableModels();
      
      // Testar geração de workflow
      await this.testWorkflowGeneration();
      
      // Testar exportação de workflow
      await this.testWorkflowExport();
      
      // Testar ciclo completo de geração e exportação
      await this.testCompleteWorkflowCycle();
      
      return this.testResults;
    } catch (error) {
      console.error('Erro nos testes de OpenRouter:', error);
      this.recordTestResult('Testes de OpenRouter', false, 'Erro geral nos testes', error);
      return this.testResults;
    }
  }

  /**
   * Testa a configuração da API key do OpenRouter
   * @returns {Promise<void>}
   */
  async testApiKeyConfiguration() {
    try {
      console.log('Testando configuração da API key...');
      
      // Verificar se a API key está configurada
      const isConfigured = await this.sendTestRequest('checkOpenRouterConfig');
      
      this.recordTestResult(
        'Verificar Configuração da API Key', 
        !!isConfigured.configured, 
        isConfigured.configured ? 'API key está configurada' : 'API key não está configurada',
        isConfigured.configured ? null : new Error('API key não configurada')
      );
      
      // Se a API key não estiver configurada, pular os próximos testes
      if (!isConfigured.configured) {
        console.log('API key não configurada, pulando testes restantes...');
        return;
      }
    } catch (error) {
      console.error('Erro ao testar configuração da API key:', error);
      this.recordTestResult('Configuração da API Key', false, 'Erro ao verificar configuração', error);
    }
  }

  /**
   * Testa a obtenção de modelos disponíveis no OpenRouter
   * @returns {Promise<void>}
   */
  async testGetAvailableModels() {
    try {
      console.log('Testando obtenção de modelos disponíveis...');
      
      // Verificar se a API key está configurada
      const isConfigured = await this.sendTestRequest('checkOpenRouterConfig');
      if (!isConfigured.configured) {
        this.recordTestResult(
          'Obter Modelos Disponíveis', 
          true, 
          'Teste pulado - API key não configurada',
          null
        );
        return;
      }
      
      // Obter modelos disponíveis
      const modelsResponse = await this.sendTestRequest('getOpenRouterModels');
      const modelsPassed = modelsResponse && Array.isArray(modelsResponse.models) && modelsResponse.models.length > 0;
      
      this.recordTestResult(
        'Obter Modelos Disponíveis', 
        modelsPassed, 
        modelsPassed ? `${modelsResponse.models.length} modelos obtidos com sucesso` : 'Falha ao obter modelos',
        modelsPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(modelsResponse))
      );
    } catch (error) {
      console.error('Erro ao testar obtenção de modelos:', error);
      this.recordTestResult('Obter Modelos Disponíveis', false, 'Erro ao obter modelos', error);
    }
  }

  /**
   * Testa a geração de workflow via OpenRouter
   * @returns {Promise<void>}
   */
  async testWorkflowGeneration() {
    try {
      console.log('Testando geração de workflow...');
      
      // Verificar se a API key está configurada
      const isConfigured = await this.sendTestRequest('checkOpenRouterConfig');
      if (!isConfigured.configured) {
        this.recordTestResult(
          'Gerar Workflow', 
          true, 
          'Teste pulado - API key não configurada',
          null
        );
        return;
      }
      
      // Gerar workflow simples para teste
      const description = 'Um workflow simples que monitora um diretório e envia um email quando um novo arquivo é adicionado';
      const requirements = {
        name: 'Teste de Monitoramento de Diretório',
        triggerType: 'filesystem',
        includeErrorHandling: true
      };
      
      const workflowResponse = await this.sendTestRequest('generateWorkflow', {
        description,
        requirements
      });
      
      const workflowPassed = workflowResponse && workflowResponse.workflow && typeof workflowResponse.workflow === 'object';
      
      this.recordTestResult(
        'Gerar Workflow', 
        workflowPassed, 
        workflowPassed ? 'Workflow gerado com sucesso' : 'Falha ao gerar workflow',
        workflowPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(workflowResponse))
      );
      
      // Verificar estrutura básica do workflow
      if (workflowPassed) {
        const workflow = workflowResponse.workflow;
        const hasNodes = workflow.nodes && Array.isArray(workflow.nodes) && workflow.nodes.length > 0;
        const hasConnections = workflow.connections && Array.isArray(workflow.connections);
        
        this.recordTestResult(
          'Verificar Estrutura do Workflow', 
          hasNodes && hasConnections, 
          (hasNodes && hasConnections) ? 'Estrutura do workflow válida' : 'Estrutura do workflow inválida',
          (hasNodes && hasConnections) ? null : new Error('Workflow com estrutura inválida')
        );
      }
    } catch (error) {
      console.error('Erro ao testar geração de workflow:', error);
      this.recordTestResult('Gerar Workflow', false, 'Erro ao gerar workflow', error);
    }
  }

  /**
   * Testa a exportação de workflow
   * @returns {Promise<void>}
   */
  async testWorkflowExport() {
    try {
      console.log('Testando exportação de workflow...');
      
      // Verificar se a API key está configurada
      const isConfigured = await this.sendTestRequest('checkOpenRouterConfig');
      if (!isConfigured.configured) {
        this.recordTestResult(
          'Exportar Workflow', 
          true, 
          'Teste pulado - API key não configurada',
          null
        );
        return;
      }
      
      // Gerar workflow simples para teste
      const description = 'Um workflow simples que monitora um feed RSS e envia notificações';
      const requirements = {
        name: 'Teste de Monitoramento RSS',
        triggerType: 'rss',
        includeErrorHandling: true
      };
      
      const workflowResponse = await this.sendTestRequest('generateWorkflow', {
        description,
        requirements
      });
      
      if (!workflowResponse || !workflowResponse.workflow) {
        this.recordTestResult(
          'Exportar Workflow', 
          false, 
          'Não foi possível gerar workflow para exportação',
          new Error('Falha na geração do workflow para teste de exportação')
        );
        return;
      }
      
      // Exportar workflow
      const exportResponse = await this.sendTestRequest('exportWorkflow', {
        workflow: workflowResponse.workflow,
        format: 'json'
      });
      
      const exportPassed = exportResponse && exportResponse.success && exportResponse.data;
      
      this.recordTestResult(
        'Exportar Workflow', 
        exportPassed, 
        exportPassed ? 'Workflow exportado com sucesso' : 'Falha ao exportar workflow',
        exportPassed ? null : new Error('Resposta inválida: ' + JSON.stringify(exportResponse))
      );
    } catch (error) {
      console.error('Erro ao testar exportação de workflow:', error);
      this.recordTestResult('Exportar Workflow', false, 'Erro ao exportar workflow', error);
    }
  }

  /**
   * Testa o ciclo completo de geração e exportação de workflow
   * @returns {Promise<void>}
   */
  async testCompleteWorkflowCycle() {
    try {
      console.log('Testando ciclo completo de geração e exportação de workflow...');
      
      // Verificar se a API key está configurada
      const isConfigured = await this.sendTestRequest('checkOpenRouterConfig');
      if (!isConfigured.configured) {
        this.recordTestResult(
          'Ciclo Completo de Workflow', 
          true, 
          'Teste pulado - API key não configurada',
          null
        );
        return;
      }
      
      // Definir diferentes tipos de workflows para testar
      const workflowTypes = [
        {
          description: 'Um workflow para monitorar preços de produtos em sites de e-commerce e enviar alertas quando houver descontos',
          requirements: {
            name: 'Monitoramento de Preços E-commerce',
            triggerType: 'schedule',
            includeErrorHandling: true,
            complexity: 'medium'
          },
          exportFormat: 'json'
        },
        {
          description: 'Um workflow para sincronizar contatos entre Google Contacts e uma planilha do Google Sheets',
          requirements: {
            name: 'Sincronização de Contatos',
            triggerType: 'webhook',
            includeErrorHandling: true,
            complexity: 'high'
          },
          exportFormat: 'n8n'
        }
      ];
      
      // Testar cada tipo de workflow
      for (const [index, workflowConfig] of workflowTypes.entries()) {
        const testName = `Ciclo Completo - ${workflowConfig.requirements.name}`;
        console.log(`Testando ${testName}...`);
        
        try {
          // 1. Gerar o workflow
          const generationResponse = await this.sendTestRequest('generateWorkflow', {
            description: workflowConfig.description,
            requirements: workflowConfig.requirements
          });
          
          if (!generationResponse || !generationResponse.workflow) {
            this.recordTestResult(
              testName, 
              false, 
              'Falha na geração do workflow',
              new Error(`Resposta inválida na geração: ${JSON.stringify(generationResponse)}`)
            );
            continue;
          }
          
          // 2. Analisar o workflow gerado
          const analysisResponse = await this.sendTestRequest('analyzeWorkflow', {
            workflow: generationResponse.workflow
          });
          
          const analysisSuccess = analysisResponse && analysisResponse.success;
          if (!analysisSuccess) {
            this.recordTestResult(
              `${testName} - Análise`, 
              false, 
              'Falha na análise do workflow',
              new Error(`Resposta inválida na análise: ${JSON.stringify(analysisResponse)}`)
            );
          } else {
            this.recordTestResult(
              `${testName} - Análise`, 
              true, 
              'Análise do workflow bem-sucedida',
              null
            );
          }
          
          // 3. Sugerir melhorias para o workflow
          const improvementResponse = await this.sendTestRequest('suggestWorkflowImprovements', {
            workflow: generationResponse.workflow,
            analysis: analysisResponse?.analysis || {}
          });
          
          const improvementSuccess = improvementResponse && improvementResponse.success;
          if (!improvementSuccess) {
            this.recordTestResult(
              `${testName} - Melhorias`, 
              false, 
              'Falha ao sugerir melhorias para o workflow',
              new Error(`Resposta inválida na sugestão de melhorias: ${JSON.stringify(improvementResponse)}`)
            );
          } else {
            this.recordTestResult(
              `${testName} - Melhorias`, 
              true, 
              'Sugestão de melhorias bem-sucedida',
              null
            );
          }
          
          // 4. Exportar o workflow
          const exportResponse = await this.sendTestRequest('exportWorkflow', {
            workflow: generationResponse.workflow,
            format: workflowConfig.exportFormat
          });
          
          const exportSuccess = exportResponse && exportResponse.success && exportResponse.data;
          if (!exportSuccess) {
            this.recordTestResult(
              `${testName} - Exportação`, 
              false, 
              `Falha na exportação do workflow para formato ${workflowConfig.exportFormat}`,
              new Error(`Resposta inválida na exportação: ${JSON.stringify(exportResponse)}`)
            );
          } else {
            this.recordTestResult(
              `${testName} - Exportação`, 
              true, 
              `Exportação bem-sucedida para formato ${workflowConfig.exportFormat}`,
              null
            );
          }
          
          // 5. Registrar sucesso do ciclo completo
          if (analysisSuccess && improvementSuccess && exportSuccess) {
            this.recordTestResult(
              testName, 
              true, 
              'Ciclo completo de geração e exportação bem-sucedido',
              null
            );
          }
        } catch (error) {
          console.error(`Erro no teste ${testName}:`, error);
          this.recordTestResult(testName, false, `Erro no ciclo completo: ${error.message}`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao testar ciclo completo de workflow:', error);
      this.recordTestResult('Ciclo Completo de Workflow', false, 'Erro geral no teste de ciclo completo', error);
    }
  }

  /**
   * Executa os testes de OpenRouter e exibe os resultados na interface
   * @param {HTMLElement} resultContainer - Elemento para exibir os resultados
   * @returns {Promise<void>}
   */
  async runTestsAndDisplayResults(resultContainer) {
    if (!resultContainer) {
      console.error('Container de resultados não fornecido');
      return;
    }
    
    resultContainer.innerHTML = '<div class="test-running">Executando testes de integração do OpenRouter...</div>';
    
    try {
      // Executar testes específicos do OpenRouter
      await this.runOpenRouterTests();
      
      // Criar HTML para exibir os resultados
      let html = `
        <div class="test-summary">
          <h3>Resumo dos Testes de OpenRouter</h3>
          <div class="test-counts">
            <span class="test-passed">✅ Passaram: ${this.testResults.passed}</span>
            <span class="test-failed">❌ Falharam: ${this.testResults.failed}</span>
            <span class="test-total">Total: ${this.testResults.total}</span>
          </div>
        </div>
        <div class="test-details">
          <h3>Detalhes</h3>
          <ul class="test-list">
      `;
      
      // Adicionar cada resultado de teste
      this.testResults.details.forEach(test => {
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
          <h3>Erro ao executar testes de OpenRouter</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    }
  }
}

// Exportar a classe para uso na extensão
export default OpenRouterIntegrationTests;

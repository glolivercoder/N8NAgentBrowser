// docker-integration-tests.js - Testes de integrau00e7u00e3o especu00edficos para a funcionalidade Docker
import { N8NIntegrationTests } from './integration-tests.js';

/**
 * Classe de testes de integrau00e7u00e3o especu00edficos para Docker
 * Testa todas as funcionalidades relacionadas ao Docker na extensu00e3o
 */
export class DockerIntegrationTests extends N8NIntegrationTests {
  constructor() {
    super();
  }

  /**
   * Executa todos os testes de integrau00e7u00e3o relacionados ao Docker
   * @returns {Object} - Resultados dos testes
   */
  async runDockerTests() {
    console.log('Iniciando testes de integrau00e7u00e3o do Docker...');
    
    // Testes de gerau00e7u00e3o de docker-compose
    await this.testDockerComposeGeneration();
    
    // Testes de ciclo de vida do container
    await this.testContainerLifecycle();
    
    // Testes de logs do container
    await this.testContainerLogs();
    
    console.log(`Testes do Docker concluu00eddos: ${this.testResults.passed} passaram, ${this.testResults.failed} falharam de um total de ${this.testResults.total}`);
    return this.testResults;
  }

  /**
   * Testa a gerau00e7u00e3o do docker-compose
   * @returns {Promise<void>}
   */
  async testDockerComposeGeneration() {
    try {
      console.log('Testando gerau00e7u00e3o de docker-compose...');
      
      // Teste 1: Gerar docker-compose com valores padru00e3o
      try {
        const generateResponse = await this.sendTestRequest('generateDockerCompose', {
          port: '5678',
          dataPath: './n8n-data'
        });
        
        const generatePassed = generateResponse && 
                              generateResponse.dockerCompose && 
                              generateResponse.dockerCompose.includes('version:') &&
                              generateResponse.dockerCompose.includes('services:') &&
                              generateResponse.dockerCompose.includes('n8n:');
        
        this.recordTestResult(
          'Gerar Docker Compose Padru00e3o', 
          generatePassed, 
          generatePassed ? 'Docker Compose padru00e3o gerado com sucesso' : 'Falha ao gerar Docker Compose padru00e3o',
          generatePassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(generateResponse))
        );
        
        // Verificar se a porta foi configurada corretamente
        if (generatePassed) {
          const portConfigured = generateResponse.dockerCompose.includes('5678:5678');
          this.recordTestResult(
            'Verificar Configurau00e7u00e3o de Porta', 
            portConfigured, 
            portConfigured ? 'Porta configurada corretamente' : 'Porta nu00e3o configurada corretamente',
            portConfigured ? null : new Error('Porta nu00e3o encontrada no docker-compose')
          );
        }
        
        // Verificar se o caminho de dados foi configurado corretamente
        if (generatePassed) {
          const dataPathConfigured = generateResponse.dockerCompose.includes('./n8n-data');
          this.recordTestResult(
            'Verificar Configurau00e7u00e3o de Caminho de Dados', 
            dataPathConfigured, 
            dataPathConfigured ? 'Caminho de dados configurado corretamente' : 'Caminho de dados nu00e3o configurado corretamente',
            dataPathConfigured ? null : new Error('Caminho de dados nu00e3o encontrado no docker-compose')
          );
        }
      } catch (error) {
        this.recordTestResult('Gerar Docker Compose Padru00e3o', false, 'Erro ao gerar Docker Compose padru00e3o', error);
      }
      
      // Teste 2: Gerar docker-compose com valores personalizados
      try {
        const customPort = '8080';
        const customPath = '/custom/data/path';
        
        const generateResponse = await this.sendTestRequest('generateDockerCompose', {
          port: customPort,
          dataPath: customPath
        });
        
        const generatePassed = generateResponse && 
                              generateResponse.dockerCompose && 
                              generateResponse.dockerCompose.includes('version:');
        
        this.recordTestResult(
          'Gerar Docker Compose Personalizado', 
          generatePassed, 
          generatePassed ? 'Docker Compose personalizado gerado com sucesso' : 'Falha ao gerar Docker Compose personalizado',
          generatePassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(generateResponse))
        );
        
        // Verificar se a porta personalizada foi configurada corretamente
        if (generatePassed) {
          const portConfigured = generateResponse.dockerCompose.includes(`${customPort}:5678`);
          this.recordTestResult(
            'Verificar Configurau00e7u00e3o de Porta Personalizada', 
            portConfigured, 
            portConfigured ? 'Porta personalizada configurada corretamente' : 'Porta personalizada nu00e3o configurada corretamente',
            portConfigured ? null : new Error('Porta personalizada nu00e3o encontrada no docker-compose')
          );
        }
        
        // Verificar se o caminho de dados personalizado foi configurado corretamente
        if (generatePassed) {
          const dataPathConfigured = generateResponse.dockerCompose.includes(customPath);
          this.recordTestResult(
            'Verificar Configurau00e7u00e3o de Caminho de Dados Personalizado', 
            dataPathConfigured, 
            dataPathConfigured ? 'Caminho de dados personalizado configurado corretamente' : 'Caminho de dados personalizado nu00e3o configurado corretamente',
            dataPathConfigured ? null : new Error('Caminho de dados personalizado nu00e3o encontrado no docker-compose')
          );
        }
      } catch (error) {
        this.recordTestResult('Gerar Docker Compose Personalizado', false, 'Erro ao gerar Docker Compose personalizado', error);
      }
      
      // Teste 3: Salvar docker-compose em arquivo
      try {
        const saveResponse = await this.sendTestRequest('saveDockerCompose', {
          dockerCompose: 'version: \'3\'\nservices:\n  n8n:\n    image: n8nio/n8n'
        });
        
        const savePassed = saveResponse && saveResponse.success === true && saveResponse.path;
        
        this.recordTestResult(
          'Salvar Docker Compose', 
          savePassed, 
          savePassed ? `Docker Compose salvo com sucesso em ${saveResponse.path}` : 'Falha ao salvar Docker Compose',
          savePassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(saveResponse))
        );
      } catch (error) {
        this.recordTestResult('Salvar Docker Compose', false, 'Erro ao salvar Docker Compose', error);
      }
    } catch (error) {
      console.error('Erro nos testes de gerau00e7u00e3o de docker-compose:', error);
      this.recordTestResult('Testes de Docker Compose', false, 'Erro geral nos testes de docker-compose', error);
    }
  }

  /**
   * Testa o ciclo de vida do container Docker
   * @returns {Promise<void>}
   */
  async testContainerLifecycle() {
    try {
      console.log('Testando ciclo de vida do container Docker...');
      
      // Teste 1: Verificar status inicial do container
      let initialStatus;
      try {
        const statusResponse = await this.sendTestRequest('checkDockerStatus');
        const statusPassed = statusResponse && typeof statusResponse.running === 'boolean';
        initialStatus = statusPassed ? statusResponse.running : false;
        
        this.recordTestResult(
          'Verificar Status Inicial do Container', 
          statusPassed, 
          statusPassed ? `Status inicial do container: ${initialStatus ? 'rodando' : 'parado'}` : 'Falha ao verificar status inicial',
          statusPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(statusResponse))
        );
      } catch (error) {
        this.recordTestResult('Verificar Status Inicial do Container', false, 'Erro ao verificar status inicial do container', error);
        return; // Interrompe os testes se nu00e3o conseguir verificar o status inicial
      }
      
      // Teste 2: Iniciar container (se nu00e3o estiver rodando)
      if (!initialStatus) {
        try {
          const startResponse = await this.sendTestRequest('startContainer');
          const startPassed = startResponse && startResponse.success === true;
          
          this.recordTestResult(
            'Iniciar Container', 
            startPassed, 
            startPassed ? 'Container iniciado com sucesso' : 'Falha ao iniciar container',
            startPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(startResponse))
          );
          
          // Verificar se o container realmente foi iniciado
          if (startPassed) {
            // Aguardar um pouco para o container inicializar
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const verifyResponse = await this.sendTestRequest('checkDockerStatus');
            const verifyPassed = verifyResponse && verifyResponse.running === true;
            
            this.recordTestResult(
              'Verificar Se Container Foi Iniciado', 
              verifyPassed, 
              verifyPassed ? 'Container estu00e1 rodando apu00f3s inicializau00e7u00e3o' : 'Container nu00e3o estu00e1 rodando apu00f3s inicializau00e7u00e3o',
              verifyPassed ? null : new Error('Container nu00e3o foi iniciado corretamente')
            );
          }
        } catch (error) {
          this.recordTestResult('Iniciar Container', false, 'Erro ao iniciar container', error);
        }
      } else {
        this.recordTestResult('Iniciar Container', true, 'Teste pulado - container ju00e1 estu00e1 rodando');
      }
      
      // Teste 3: Reiniciar container
      try {
        const restartResponse = await this.sendTestRequest('restartContainer');
        const restartPassed = restartResponse && restartResponse.success === true;
        
        this.recordTestResult(
          'Reiniciar Container', 
          restartPassed, 
          restartPassed ? 'Container reiniciado com sucesso' : 'Falha ao reiniciar container',
          restartPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(restartResponse))
        );
        
        // Verificar se o container ainda estu00e1 rodando apu00f3s reiniciar
        if (restartPassed) {
          // Aguardar um pouco para o container reinicializar
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const verifyResponse = await this.sendTestRequest('checkDockerStatus');
          const verifyPassed = verifyResponse && verifyResponse.running === true;
          
          this.recordTestResult(
            'Verificar Se Container Foi Reiniciado', 
            verifyPassed, 
            verifyPassed ? 'Container estu00e1 rodando apu00f3s reinicializau00e7u00e3o' : 'Container nu00e3o estu00e1 rodando apu00f3s reinicializau00e7u00e3o',
            verifyPassed ? null : new Error('Container nu00e3o foi reiniciado corretamente')
          );
        }
      } catch (error) {
        this.recordTestResult('Reiniciar Container', false, 'Erro ao reiniciar container', error);
      }
      
      // Teste 4: Parar container
      try {
        const stopResponse = await this.sendTestRequest('stopContainer');
        const stopPassed = stopResponse && stopResponse.success === true;
        
        this.recordTestResult(
          'Parar Container', 
          stopPassed, 
          stopPassed ? 'Container parado com sucesso' : 'Falha ao parar container',
          stopPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(stopResponse))
        );
        
        // Verificar se o container realmente foi parado
        if (stopPassed) {
          // Aguardar um pouco para o container parar
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const verifyResponse = await this.sendTestRequest('checkDockerStatus');
          const verifyPassed = verifyResponse && verifyResponse.running === false;
          
          this.recordTestResult(
            'Verificar Se Container Foi Parado', 
            verifyPassed, 
            verifyPassed ? 'Container estu00e1 parado apu00f3s comando de parada' : 'Container nu00e3o estu00e1 parado apu00f3s comando de parada',
            verifyPassed ? null : new Error('Container nu00e3o foi parado corretamente')
          );
        }
      } catch (error) {
        this.recordTestResult('Parar Container', false, 'Erro ao parar container', error);
      }
      
      // Teste 5: Restaurar estado inicial (se necessu00e1rio)
      if (initialStatus) {
        try {
          const startResponse = await this.sendTestRequest('startContainer');
          const startPassed = startResponse && startResponse.success === true;
          
          this.recordTestResult(
            'Restaurar Estado Inicial do Container', 
            startPassed, 
            startPassed ? 'Estado inicial do container restaurado com sucesso' : 'Falha ao restaurar estado inicial do container',
            startPassed ? null : new Error('Falha ao restaurar estado inicial')
          );
        } catch (error) {
          this.recordTestResult('Restaurar Estado Inicial do Container', false, 'Erro ao restaurar estado inicial do container', error);
        }
      } else {
        this.recordTestResult('Restaurar Estado Inicial do Container', true, 'Teste pulado - estado inicial ju00e1 era parado');
      }
    } catch (error) {
      console.error('Erro nos testes de ciclo de vida do container:', error);
      this.recordTestResult('Testes de Ciclo de Vida do Container', false, 'Erro geral nos testes de ciclo de vida', error);
    }
  }

  /**
   * Testa a obtenu00e7u00e3o e exibiu00e7u00e3o de logs do container
   * @returns {Promise<void>}
   */
  async testContainerLogs() {
    try {
      console.log('Testando obtenu00e7u00e3o de logs do container...');
      
      // Verificar se o container estu00e1 rodando
      const statusResponse = await this.sendTestRequest('checkDockerStatus');
      if (!statusResponse || !statusResponse.running) {
        this.recordTestResult(
          'Obter Logs do Container', 
          true, 
          'Teste pulado - container nu00e3o estu00e1 rodando',
          null
        );
        return;
      }
      
      // Teste 1: Obter logs com nu00famero padru00e3o de linhas
      try {
        const logsResponse = await this.sendTestRequest('getDockerLogs');
        const logsPassed = logsResponse && typeof logsResponse.logs === 'string';
        
        this.recordTestResult(
          'Obter Logs Padru00e3o', 
          logsPassed, 
          logsPassed ? 'Logs obtidos com sucesso' : 'Falha ao obter logs',
          logsPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(logsResponse))
        );
      } catch (error) {
        this.recordTestResult('Obter Logs Padru00e3o', false, 'Erro ao obter logs padru00e3o', error);
      }
      
      // Teste 2: Obter logs com nu00famero especu00edfico de linhas
      try {
        const lines = 10;
        const logsResponse = await this.sendTestRequest('getDockerLogs', { lines });
        const logsPassed = logsResponse && typeof logsResponse.logs === 'string';
        
        this.recordTestResult(
          'Obter Logs com Linhas Especu00edficas', 
          logsPassed, 
          logsPassed ? `Logs com ${lines} linhas obtidos com sucesso` : 'Falha ao obter logs com linhas especu00edficas',
          logsPassed ? null : new Error('Resposta invu00e1lida: ' + JSON.stringify(logsResponse))
        );
        
        // Verificar se o nu00famero de linhas u00e9 aproximadamente o solicitado
        // (pode ser menor se o container nu00e3o tiver muitos logs)
        if (logsPassed) {
          const logLines = logsResponse.logs.split('\n').filter(line => line.trim().length > 0);
          const lineCountCorrect = logLines.length <= lines + 5; // Permitir algumas linhas extras devido a formatau00e7u00e3o
          
          this.recordTestResult(
            'Verificar Nu00famero de Linhas de Log', 
            lineCountCorrect, 
            lineCountCorrect ? `Nu00famero de linhas de log correto: ${logLines.length}` : `Nu00famero de linhas de log incorreto: ${logLines.length} (esperado ~${lines})`,
            lineCountCorrect ? null : new Error('Nu00famero de linhas de log nu00e3o corresponde ao solicitado')
          );
        }
      } catch (error) {
        this.recordTestResult('Obter Logs com Linhas Especu00edficas', false, 'Erro ao obter logs com linhas especu00edficas', error);
      }
    } catch (error) {
      console.error('Erro nos testes de logs do container:', error);
      this.recordTestResult('Testes de Logs do Container', false, 'Erro geral nos testes de logs', error);
    }
  }

  /**
   * Executa os testes de Docker e exibe os resultados na interface
   * @param {HTMLElement} resultContainer - Elemento para exibir os resultados
   * @returns {Promise<void>}
   */
  async runTestsAndDisplayResults(resultContainer) {
    if (!resultContainer) {
      console.error('Container de resultados nu00e3o fornecido');
      return;
    }
    
    resultContainer.innerHTML = '<div class="test-running">Executando testes de integrau00e7u00e3o do Docker...</div>';
    
    try {
      // Executar testes especu00edficos do Docker primeiro
      await this.runDockerTests();
      
      // Criar HTML para exibir os resultados
      let html = `
        <div class="test-summary">
          <h3>Resumo dos Testes de Docker</h3>
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
          <h3>Erro ao executar testes de Docker</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    }
  }
}

// Exportar a classe para uso na extensu00e3o
export default DockerIntegrationTests;

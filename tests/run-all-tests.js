// run-all-tests.js - Script para executar todos os testes da extensu00e3o N8N Browser Agents
import { N8NIntegrationTests } from './integration-tests.js';
import DockerIntegrationTests from './docker-integration-tests.js';
import OpenRouterIntegrationTests from './openrouter-integration-tests.js';
import UITests from './ui-tests.js';

/**
 * Classe para executar todos os testes da extensu00e3o e gerar um relatu00f3rio unificado
 */
class TestRunner {
  constructor() {
    this.integrationTests = new N8NIntegrationTests();
    this.dockerTests = new DockerIntegrationTests();
    this.openRouterTests = new OpenRouterIntegrationTests();
    this.uiTests = new UITests();
    
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      categories: [],
      details: []
    };
  }

  /**
   * Executa todos os testes disponu00edveis
   * @returns {Promise<Object>} - Resultados consolidados dos testes
   */
  async runAllTests() {
    console.log('Iniciando execuu00e7u00e3o de todos os testes...');
    
    // Executar testes de integrau00e7u00e3o gerais
    await this.runTestCategory('Integrau00e7u00e3o Geral', async () => {
      return await this.integrationTests.runAllTests();
    });
    
    // Executar testes de Docker
    await this.runTestCategory('Docker', async () => {
      return await this.dockerTests.runDockerTests();
    });
    
    // Executar testes de OpenRouter
    await this.runTestCategory('OpenRouter', async () => {
      return await this.openRouterTests.runOpenRouterTests();
    });
    
    // Executar testes de UI
    await this.runTestCategory('Interface do Usuu00e1rio', async () => {
      return await this.uiTests.runUITests();
    });
    
    // Calcular estatu00edsticas finais
    this.calculateFinalStats();
    
    // Gerar relatu00f3rio
    this.generateReport();
    
    return this.testResults;
  }

  /**
   * Executa uma categoria especu00edfica de testes
   * @param {string} categoryName - Nome da categoria de testes
   * @param {Function} testFunction - Funu00e7u00e3o que executa os testes
   * @returns {Promise<void>}
   */
  async runTestCategory(categoryName, testFunction) {
    console.log(`\nExecutando testes de ${categoryName}...`);
    
    try {
      const results = await testFunction();
      
      // Registrar resultados da categoria
      this.testResults.categories.push({
        name: categoryName,
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        details: results.details || []
      });
      
      console.log(`Testes de ${categoryName} concluu00eddos: ${results.passed} passaram, ${results.failed} falharam de um total de ${results.total}`);
    } catch (error) {
      console.error(`Erro ao executar testes de ${categoryName}:`, error);
      
      // Registrar erro na categoria
      this.testResults.categories.push({
        name: categoryName,
        passed: 0,
        failed: 1,
        total: 1,
        details: [{
          name: `Execuu00e7u00e3o de testes de ${categoryName}`,
          success: false,
          message: `Erro ao executar testes: ${error.message}`,
          error: error
        }]
      });
    }
  }

  /**
   * Calcula as estatu00edsticas finais dos testes
   */
  calculateFinalStats() {
    // Somar resultados de todas as categorias
    this.testResults.categories.forEach(category => {
      this.testResults.passed += category.passed;
      this.testResults.failed += category.failed;
      this.testResults.total += category.total;
      
      // Adicionar detalhes dos testes
      if (category.details && category.details.length > 0) {
        category.details.forEach(detail => {
          this.testResults.details.push({
            category: category.name,
            ...detail
          });
        });
      }
    });
  }

  /**
   * Gera um relatu00f3rio dos testes executados
   */
  generateReport() {
    console.log('\n==================================================');
    console.log('           RELATu00d3RIO DE TESTES');
    console.log('==================================================');
    console.log(`Total de testes: ${this.testResults.total}`);
    console.log(`Testes passados: ${this.testResults.passed} (${Math.round(this.testResults.passed / this.testResults.total * 100)}%)`);
    console.log(`Testes falhos: ${this.testResults.failed} (${Math.round(this.testResults.failed / this.testResults.total * 100)}%)`);
    console.log('--------------------------------------------------');
    
    // Exibir resultados por categoria
    console.log('\nResultados por categoria:');
    this.testResults.categories.forEach(category => {
      const passRate = category.total > 0 ? Math.round(category.passed / category.total * 100) : 0;
      console.log(`- ${category.name}: ${category.passed}/${category.total} (${passRate}%)`);
    });
    
    // Exibir detalhes dos testes falhos
    if (this.testResults.failed > 0) {
      console.log('\nDetalhes dos testes falhos:');
      this.testResults.details
        .filter(detail => !detail.success)
        .forEach(detail => {
          console.log(`- [${detail.category}] ${detail.name}: ${detail.message || 'Falha no teste'}`);
        });
    }
    
    console.log('\n==================================================');
    console.log(`Relatu00f3rio gerado em: ${new Date().toLocaleString()}`);
    console.log('==================================================');
  }
}

// Exportar a classe para uso na extensu00e3o
export default TestRunner;

// Se este script for executado diretamente, rodar os testes
if (typeof window !== 'undefined' && window.location.href.includes('run-all-tests.html')) {
  const runner = new TestRunner();
  runner.runAllTests();
}

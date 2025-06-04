/**
 * Classe melhorada para integração com a API OpenRouter
 * Resolve problemas de configuração e persistência da API key
 */
export class OpenRouterAPI {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.apiKey = '';
    this.defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    };
    
    // Inicializar API key do storage de forma síncrona
    this.initializeApiKey();
  }
  
  /**
   * Inicializa a API key de forma síncrona
   */
  initializeApiKey() {
    // Tentar carregar a API key imediatamente
    this.loadApiKey().catch(error => {
      console.warn('Não foi possível carregar API key na inicialização:', error);
    });
  }
  
  /**
   * Carrega a API key do storage local
   */
  async loadApiKey() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await chrome.storage.local.get('settings');
        if (data.settings && data.settings.openrouterApiKey) {
          this.apiKey = data.settings.openrouterApiKey;
          console.log('API key carregada com sucesso');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao carregar API key:', error);
      return false;
    }
  }
  
  /**
   * Define a API key e salva no storage
   * @param {string} apiKey - API key da OpenRouter
   */
  async setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key deve ser uma string válida');
    }
    
    this.apiKey = apiKey.trim();
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Obter configurações existentes
        const data = await chrome.storage.local.get('settings');
        const settings = data.settings || {};
        
        // Atualizar com a nova API key
        settings.openrouterApiKey = this.apiKey;
        
        // Salvar de volta
        await chrome.storage.local.set({ settings });
        console.log('API key salva com sucesso no storage');
        return true;
      } else {
        console.warn('Chrome storage não disponível, API key apenas em memória');
        return true;
      }
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se a API key está configurada
   * @returns {boolean} - True se a API key estiver configurada
   */
  isConfigured() {
    return !!(this.apiKey && this.apiKey.trim().length > 0);
  }
  
  /**
   * Força o recarregamento da API key do storage
   */
  async reloadApiKey() {
    return await this.loadApiKey();
  }
  
  /**
   * Constrói os headers para as requisições
   * @returns {Object} - Headers da requisição
   */
  getHeaders() {
    if (!this.isConfigured()) {
      throw new Error('API key não configurada. Configure a API key antes de fazer requisições.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'https://n8n-workflow-assistant.extension',
      'X-Title': 'N8N Workflow Assistant'
    };
  }
  
  /**
   * Testa a conexão com a API OpenRouter
   * @returns {Promise<boolean>} - True se a conexão for bem-sucedida
   */
  async testConnection() {
    try {
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key não configurada');
        }
      }
      
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        console.log('Conexão com OpenRouter testada com sucesso');
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      throw error;
    }
  }
  
  /**
   * Obtém a lista de modelos disponíveis na OpenRouter
   * @returns {Promise<Array>} - Lista de modelos
   */
  async getAvailableModels() {
    try {
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key não configurada');
        }
      }
      
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`${data.data?.length || 0} modelos obtidos da OpenRouter`);
      return data.data || [];
    } catch (error) {
      console.error('Erro ao obter modelos:', error);
      throw error;
    }
  }
  
  /**
   * Gera uma completion usando a API OpenRouter
   * @param {string} prompt - Texto de entrada
   * @param {Object} options - Opções para a geração
   * @returns {Promise<Object>} - Resposta da API
   */
  async generateCompletion(prompt, options = {}) {
    try {
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key não configurada');
        }
      }
      
      const model = options.model || this.defaultModel;
      const params = { ...this.defaultParams, ...options };
      
      const requestBody = {
        model: model,
        messages: [
          { 
            role: 'system', 
            content: options.systemPrompt || 'Você é um assistente especializado em automação de workflows N8N.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        stream: false
      };
      
      console.log('Enviando requisição para OpenRouter...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Completion gerada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao gerar completion:', error);
      throw error;
    }
  }
  
  /**
   * Gera um workflow completo do N8N a partir de uma descrição
   * @param {string} description - Descrição do workflow
   * @param {Object} requirements - Requisitos específicos
   * @returns {Promise<Object>} - Workflow gerado em formato JSON
   */
  async generateN8NWorkflow(description, requirements = {}) {
    const systemPrompt = `
      Você é um especialista em automação de workflows N8N. Sua tarefa é gerar um workflow N8N completo
      em formato JSON a partir de uma descrição. O workflow deve ser válido e pronto para importação no N8N.
      
      Siga estas diretrizes:
      1. Crie um workflow que atenda exatamente à descrição fornecida
      2. Inclua todos os nós necessários, configurados corretamente
      3. Estabeleça as conexões apropriadas entre os nós
      4. Use as melhores práticas de automação do N8N
      5. Inclua comentários explicativos nos nós quando apropriado
      
      Retorne APENAS o JSON do workflow, sem explicações adicionais.
    `;
    
    const prompt = `
      Crie um workflow N8N completo para a seguinte necessidade:
      
      ${description}
      
      Requisitos adicionais:
      - Nome do workflow: ${requirements.name || 'Workflow Gerado'}
      - Tipo de trigger: ${requirements.triggerType || 'webhook'}
      ${requirements.includeErrorHandling ? '- Inclua tratamento de erros\n' : ''}
      ${requirements.includeLogging ? '- Inclua nós de logging\n' : ''}
      
      Gere o JSON completo do workflow.
    `;
    
    try {
      const response = await this.generateCompletion(prompt, {
        systemPrompt,
        temperature: 0.3,
        max_tokens: 4000
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      // Extrair JSON da resposta
      let workflowJson;
      try {
        // Tentar extrair JSON de blocos de código
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          workflowJson = JSON.parse(jsonMatch[1]);
        } else {
          // Tentar interpretar toda a resposta como JSON
          workflowJson = JSON.parse(content);
        }
      } catch (e) {
        console.error('Erro ao extrair JSON do workflow:', e);
        // Retornar um workflow básico se não conseguir parsear
        workflowJson = {
          name: requirements.name || 'Workflow Gerado',
          description: description,
          nodes: [
            {
              id: 'start',
              type: 'n8n-nodes-base.start',
              position: [100, 100],
              parameters: {}
            }
          ],
          connections: {},
          createdAt: new Date().toISOString(),
          generatedBy: 'OpenRouter API',
          originalPrompt: description
        };
      }
      
      console.log('Workflow N8N gerado com sucesso');
      return workflowJson;
    } catch (error) {
      console.error('Erro ao gerar workflow:', error);
      throw error;
    }
  }
  
  /**
   * Analisa um workflow existente e fornece insights
   * @param {Object} workflow - Workflow a ser analisado
   * @returns {Promise<Object>} - Análise do workflow
   */
  async analyzeWorkflow(workflow) {
    const systemPrompt = `
      Você é um especialista em automação de workflows N8N. Sua tarefa é analisar um workflow existente
      e fornecer insights detalhados sobre sua estrutura, eficiência e possíveis melhorias.
      
      Sua análise deve incluir:
      1. Visão geral do workflow e seu propósito
      2. Avaliação da estrutura e fluxo de dados
      3. Identificação de possíveis gargalos ou ineficiências
      4. Avaliação de práticas de tratamento de erros
      5. Sugestões específicas de melhorias
      
      Formate sua resposta em HTML simples para melhor legibilidade.
    `;
    
    const workflowStr = JSON.stringify(workflow, null, 2);
    const prompt = `
      Analise o seguinte workflow N8N:
      
      ${workflowStr}
      
      Forneça uma análise detalhada seguindo as diretrizes especificadas.
    `;
    
    try {
      const response = await this.generateCompletion(prompt, {
        systemPrompt,
        temperature: 0.3,
        max_tokens: 2000
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      return {
        text: content,
        html: content
      };
    } catch (error) {
      console.error('Erro ao analisar workflow:', error);
      throw error;
    }
  }
  
  /**
   * Exporta um workflow para diferentes formatos
   * @param {Object} workflow - Workflow a ser exportado
   * @param {string} format - Formato de exportação ('json', 'n8n', 'yaml')
   * @returns {Promise<string>} - Workflow exportado no formato especificado
   */
  async exportWorkflow(workflow, format = 'json') {
    try {
      if (format === 'json') {
        return JSON.stringify(workflow, null, 2);
      }
      
      if (format === 'n8n') {
        // Formato específico do N8N para importação
        const n8nFormat = {
          name: workflow.name || 'Exported Workflow',
          nodes: workflow.nodes || [],
          connections: workflow.connections || {},
          active: false,
          settings: {},
          id: workflow.id || Date.now().toString()
        };
        return JSON.stringify(n8nFormat, null, 2);
      }
      
      if (format === 'yaml') {
        // Conversão simples para YAML (sem biblioteca externa)
        const yamlContent = this.jsonToYaml(workflow);
        return yamlContent;
      }
      
      throw new Error(`Formato não suportado: ${format}`);
    } catch (error) {
      console.error('Erro ao exportar workflow:', error);
      throw error;
    }
  }
  
  /**
   * Converte JSON para YAML simples
   * @param {Object} obj - Objeto a ser convertido
   * @param {number} indent - Nível de indentação
   * @returns {string} - String YAML
   */
  jsonToYaml(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${this.jsonToYaml(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${this.jsonToYaml(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }
  
  /**
   * Obtém estatísticas de uso da API
   * @returns {Promise<Object>} - Estatísticas de uso
   */
  async getUsageStats() {
    try {
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key não configurada');
        }
      }
      
      const response = await fetch(`${this.baseUrl}/auth/key`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        usage: data.usage || 0,
        quota: data.quota || 0,
        resetsAt: data.resetsAt || null
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de uso:', error);
      throw error;
    }
  }
}

// Criar instância global para uso na extensão
let globalOpenRouterAPI = null;

/**
 * Obtém a instância global da API OpenRouter
 * @returns {OpenRouterAPI} - Instância da API
 */
export function getOpenRouterAPI() {
  if (!globalOpenRouterAPI) {
    globalOpenRouterAPI = new OpenRouterAPI();
  }
  return globalOpenRouterAPI;
}

// Exportar a classe e a instância global
export { OpenRouterAPI as default };
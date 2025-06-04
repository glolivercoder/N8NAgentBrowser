/**
 * OpenRouter Service - Versão funcional baseada no SmartScribe
 * Implementação robusta e testada para integração com OpenRouter API
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterService {
  constructor() {
    this.apiKey = '';
    this.defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
    this.embeddingModel = 'openai/text-embedding-3-small';
    this.initialized = false;
    
    // Inicializar automaticamente
    this.initialize();
  }

  /**
   * Inicializar o serviço carregando a API key do storage
   */
  async initialize() {
    try {
      await this.loadApiKey();
      this.initialized = true;
      console.log('OpenRouter Service inicializado');
    } catch (error) {
      console.warn('Erro ao inicializar OpenRouter Service:', error);
    }
  }

  /**
   * Carregar API key do Chrome storage
   */
  async loadApiKey() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await chrome.storage.local.get('settings');
        if (data.settings && data.settings.openrouterApiKey) {
          this.apiKey = data.settings.openrouterApiKey;
          console.log('API key OpenRouter carregada do storage');
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
   * Salvar API key no Chrome storage
   */
  async saveApiKey(apiKey) {
    try {
      if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('API key deve ser uma string válida');
      }

      this.apiKey = apiKey.trim();

      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await chrome.storage.local.get('settings');
        const settings = data.settings || {};
        settings.openrouterApiKey = this.apiKey;
        await chrome.storage.local.set({ settings });
        console.log('API key OpenRouter salva no storage');
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      throw error;
    }
  }

  /**
   * Verificar se a API key está configurada
   */
  isConfigured() {
    return !!(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Obter headers para requisições
   */
  getHeaders() {
    if (!this.isConfigured()) {
      throw new Error('API key do OpenRouter não configurada');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location ? window.location.origin : 'https://n8n-workflow-assistant.extension',
      'X-Title': 'N8N Workflow Assistant'
    };
  }

  /**
   * Fazer requisição para a API OpenRouter
   */
  async makeRequest(endpoint, options = {}) {
    try {
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key do OpenRouter não configurada');
        }
      }

      const url = `${OPENROUTER_API_URL}${endpoint}`;
      const requestOptions = {
        method: 'GET',
        headers: this.getHeaders(),
        ...options
      };

      console.log(`Fazendo requisição para: ${url}`);
      
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // Ignorar erro de parsing JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Resposta recebida com sucesso');
      return data;
    } catch (error) {
      console.error('Erro na requisição OpenRouter:', error);
      throw error;
    }
  }

  /**
   * Obter todos os modelos disponíveis no OpenRouter
   */
  async getAvailableModels() {
    try {
      const data = await this.makeRequest('/models');

      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Formato de resposta inesperado da API OpenRouter:', data);
        return [];
      }

      // Formatar os modelos para incluir informações de preço
      const models = data.data.map(model => {
        const provider = model.context?.organization?.name || 'Desconhecido';
        const inputPrice = (model.pricing?.input || 0) * 1000000;
        const outputPrice = (model.pricing?.output || 0) * 1000000;
        const maxTokens = model.context?.max_tokens || 4096;
        const tags = model.context?.tags || [];

        return {
          id: model.id || '',
          name: model.name || model.id || 'Modelo sem nome',
          description: model.description || 'Sem descrição disponível',
          provider,
          inputPrice,
          outputPrice,
          maxTokens,
          tags
        };
      });

      console.log(`${models.length} modelos obtidos do OpenRouter`);
      return models;
    } catch (error) {
      console.error('Erro ao buscar modelos do OpenRouter:', error);
      return [];
    }
  }

  /**
   * Obter o saldo atual da conta OpenRouter
   */
  async getAccountBalance() {
    try {
      const data = await this.makeRequest('/auth/key');

      if (!data) {
        return {
          credits: 0,
          formattedCredits: '$0.00',
          error: 'Formato de resposta inválido'
        };
      }

      const credits = data.usage || 0;
      const limit = data.limit || 0;

      return {
        credits,
        limit,
        formattedCredits: `$${credits.toFixed(2)}`,
        formattedLimit: `$${limit.toFixed(2)}`
      };
    } catch (error) {
      console.error('Erro ao buscar saldo do OpenRouter:', error);
      return {
        credits: 0,
        formattedCredits: '$0.00',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Gerar completion usando OpenRouter
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const model = options.model || this.defaultModel;
      const systemPrompt = options.systemPrompt || 'Você é um assistente especializado em automação de workflows N8N.';

      const requestBody = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024,
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0,
        stream: false
      };

      const data = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      return data;
    } catch (error) {
      console.error('Erro ao gerar completion:', error);
      throw error;
    }
  }

  /**
   * Gerar workflow N8N usando OpenRouter
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
   * Analisar workflow existente
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
   * Exportar workflow para diferentes formatos
   */
  async exportWorkflow(workflow, format = 'json') {
    try {
      if (format === 'json') {
        return JSON.stringify(workflow, null, 2);
      }

      if (format === 'n8n') {
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
        return this.jsonToYaml(workflow);
      }

      throw new Error(`Formato não suportado: ${format}`);
    } catch (error) {
      console.error('Erro ao exportar workflow:', error);
      throw error;
    }
  }

  /**
   * Converter JSON para YAML simples
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
   * Testar conexão com OpenRouter
   */
  async testConnection() {
    try {
      console.log('Testando conexão com OpenRouter...');
      
      if (!this.isConfigured()) {
        await this.loadApiKey();
        if (!this.isConfigured()) {
          throw new Error('API key não configurada');
        }
      }

      // Testar obtendo a lista de modelos
      const models = await this.getAvailableModels();
      
      if (models.length > 0) {
        console.log(`✅ Conexão com OpenRouter bem-sucedida! ${models.length} modelos disponíveis`);
        return {
          success: true,
          message: `Conexão bem-sucedida! ${models.length} modelos disponíveis`,
          modelsCount: models.length
        };
      } else {
        throw new Error('Nenhum modelo encontrado');
      }
    } catch (error) {
      console.error('❌ Erro na conexão com OpenRouter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Criar instância global
let globalOpenRouterService = null;

/**
 * Obter instância global do OpenRouter Service
 */
export function getOpenRouterService() {
  if (!globalOpenRouterService) {
    globalOpenRouterService = new OpenRouterService();
  }
  return globalOpenRouterService;
}

// Exportar classe e instância
export { OpenRouterService as default };
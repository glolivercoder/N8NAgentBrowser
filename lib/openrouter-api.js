/**
 * Classe para integração com a API OpenRouter
 * Permite gerar completions, streaming, obter modelos, estatísticas
 * e funcionalidades específicas para N8N
 */
class OpenRouterAPI {
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
    
    // Inicializar API key do storage
    this.loadApiKey();
  }
  
  /**
   * Carrega a API key do storage local
   */
  async loadApiKey() {
    try {
      const data = await chrome.storage.local.get('settings');
      if (data.settings && data.settings.openRouterApiKey) {
        this.apiKey = data.settings.openRouterApiKey;
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error);
    }
  }
  
  /**
   * Define a API key
   * @param {string} apiKey - API key da OpenRouter
   */
  async setApiKey(apiKey) {
    this.apiKey = apiKey;
    
    try {
      const settings = await chrome.storage.local.get('settings');
      const updatedSettings = settings.settings || {};
      updatedSettings.openRouterApiKey = apiKey;
      
      await chrome.storage.local.set({ settings: updatedSettings });
      return true;
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      return false;
    }
  }
  
  /**
   * Verifica se a API key está configurada
   * @returns {boolean} - True se a API key estiver configurada
   */
  isConfigured() {
    return !!this.apiKey;
  }
  
  /**
   * Constrói os headers para as requisições
   * @returns {Object} - Headers da requisição
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'https://n8n-workflow-assistant.extension',
      'X-Title': 'N8N Workflow Assistant'
    };
  }
  
  /**
   * Gera uma completion usando a API OpenRouter
   * @param {string} prompt - Texto de entrada
   * @param {Object} options - Opções para a geração
   * @returns {Promise<Object>} - Resposta da API
   */
  async generateCompletion(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('API key não configurada');
    }
    
    const model = options.model || this.defaultModel;
    const params = { ...this.defaultParams, ...options };
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: options.systemPrompt || 'Você é um assistente especializado em automação de workflows N8N.' },
            { role: 'user', content: prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          top_p: params.top_p,
          frequency_penalty: params.frequency_penalty,
          presence_penalty: params.presence_penalty,
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao gerar completion:', error);
      throw error;
    }
  }
  
  /**
   * Gera uma completion com streaming usando a API OpenRouter
   * @param {string} prompt - Texto de entrada
   * @param {Function} onChunk - Callback para cada chunk recebido
   * @param {Object} options - Opções para a geração
   * @returns {Promise<void>}
   */
  async streamCompletion(prompt, onChunk, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('API key não configurada');
    }
    
    const model = options.model || this.defaultModel;
    const params = { ...this.defaultParams, ...options };
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: options.systemPrompt || 'Você é um assistente especializado em automação de workflows N8N.' },
            { role: 'user', content: prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          top_p: params.top_p,
          frequency_penalty: params.frequency_penalty,
          presence_penalty: params.presence_penalty,
          stream: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Erro ao processar chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro no streaming:', error);
      throw error;
    }
  }
  
  /**
   * Obtém a lista de modelos disponíveis na OpenRouter
   * @returns {Promise<Array>} - Lista de modelos
   */
  async getAvailableModels() {
    if (!this.isConfigured()) {
      throw new Error('API key não configurada');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao obter modelos:', error);
      throw error;
    }
  }
  
  /**
   * Obtém estatísticas de uso da API
   * @returns {Promise<Object>} - Estatísticas de uso
   */
  async getUsageStats() {
    if (!this.isConfigured()) {
      throw new Error('API key não configurada');
    }
    
    try {
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
        throw new Error('O modelo gerou um JSON inválido para o workflow');
      }
      
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
      
      Formate sua resposta em HTML simples para melhor legibilidade, usando tags como <h3>, <p>, <ul>, <li>, etc.
    `;
    
    const workflowStr = JSON.stringify(workflow);
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
        html: content // Já estamos solicitando HTML formatado na resposta
      };
    } catch (error) {
      console.error('Erro ao analisar workflow:', error);
      throw error;
    }
  }
  
  /**
   * Sugere melhorias para um workflow existente
   * @param {Object} workflow - Workflow a ser melhorado
   * @param {string} context - Contexto adicional
   * @returns {Promise<Object>} - Sugestões de melhorias
   */
  async suggestImprovements(workflow, context = '') {
    const systemPrompt = `
      Você é um especialista em automação de workflows N8N. Sua tarefa é sugerir melhorias
      específicas para um workflow existente, com base nas melhores práticas e na eficiência.
      
      Suas sugestões devem:
      1. Ser específicas e acionáveis
      2. Incluir exemplos de implementação quando relevante
      3. Considerar performance, manutenção e escalabilidade
      4. Respeitar o propósito original do workflow
      5. Levar em conta qualquer contexto adicional fornecido
      
      Formate sua resposta em HTML simples para melhor legibilidade, usando tags como <h3>, <p>, <ul>, <li>, etc.
    `;
    
    const workflowStr = JSON.stringify(workflow);
    const prompt = `
      Sugira melhorias para o seguinte workflow N8N:
      
      ${workflowStr}
      
      ${context ? `Contexto adicional: ${context}` : ''}
      
      Forneça sugestões detalhadas e acionáveis seguindo as diretrizes especificadas.
    `;
    
    try {
      const response = await this.generateCompletion(prompt, {
        systemPrompt,
        temperature: 0.4,
        max_tokens: 2000
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      return {
        text: content,
        html: content // Já estamos solicitando HTML formatado na resposta
      };
    } catch (error) {
      console.error('Erro ao sugerir melhorias:', error);
      throw error;
    }
  }
}

// Exportar a classe
export { OpenRouterAPI };

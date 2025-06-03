// openrouter-api.js - OpenRouter API Integration
export class OpenRouterAPI {
  constructor() {
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.apiKey = null;
    this.defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
    this.init();
  }

  async init() {
    const settings = await chrome.storage.local.get('settings');
    if (settings.settings?.openRouterApiKey) {
      this.apiKey = settings.settings.openRouterApiKey;
    }
  }

  async setApiKey(apiKey) {
    this.apiKey = apiKey;
    const settings = await chrome.storage.local.get('settings');
    await chrome.storage.local.set({
      settings: {
        ...settings.settings,
        openRouterApiKey: apiKey
      }
    });
  }

  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const requestBody = {
      model: options.model || this.defaultModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      top_p: options.topP || 0.9,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'N8N Workflow Assistant'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter API request failed:', error);
      throw error;
    }
  }

  async generateStreamCompletion(systemPrompt, userPrompt, onChunk, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const requestBody = {
      model: options.model || this.defaultModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: true
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'N8N Workflow Assistant'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter streaming request failed:', error);
      throw error;
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'N8N Workflow Assistant'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  async getUsageStats() {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/key`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'N8N Workflow Assistant'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }

  // Método específico para gerar workflows N8N
  async generateN8NWorkflow(description, requirements = {}) {
    const systemPrompt = `
    Você é um especialista em N8N workflows. Gere um workflow JSON válido e completo baseado na descrição fornecida.
    
    IMPORTANTE: Retorne APENAS o JSON do workflow, sem explicações adicionais.
    
    Estrutura obrigatória:
    {
      "name": "Nome descritivo do workflow",
      "nodes": [
        {
          "id": "uuid-único",
          "name": "Nome do nó",
          "type": "tipo-do-nó",
          "typeVersion": 1,
          "position": [x, y],
          "parameters": {...}
        }
      ],
      "connections": {
        "Node Name": {
          "main": [[{"node": "Next Node", "type": "main", "index": 0}]]
        }
      },
      "active": true,
      "settings": {
        "executionOrder": "v1"
      },
      "pinData": {},
      "versionId": "1"
    }
    
    Requisitos específicos:
    ${JSON.stringify(requirements, null, 2)}
    
    Sempre inclua:
    1. Um nó de trigger apropriado
    2. Nós de processamento necessários
    3. Nó de saída/ação final
    4. Conexões corretas entre os nós
    5. Parâmetros realistas para cada nó
    `;

    return await this.generateCompletion(systemPrompt, description, {
      temperature: 0.3, // Menor temperatura para maior consistência
      maxTokens: 4000
    });
  }

  // Método para análise de workflows existentes
  async analyzeWorkflow(workflow) {
    const systemPrompt = `
    Analise este workflow N8N e forneça um relatório detalhado incluindo:
    
    1. **Resumo do Workflow**: O que o workflow faz
    2. **Análise de Performance**: Possíveis gargalos e otimizações
    3. **Segurança**: Vulnerabilidades ou práticas inseguras
    4. **Melhores Práticas**: Sugestões de melhorias
    5. **Compatibilidade**: Versões de nós e dependências
    6. **Pontuação Geral**: De 1-10 com justificativa
    
    Seja específico e prático nas recomendações.
    `;

    const workflowStr = JSON.stringify(workflow, null, 2);
    return await this.generateCompletion(systemPrompt, `Workflow para análise:\n\n${workflowStr}`);
  }

  // Método para sugerir melhorias em workflows
  async suggestImprovements(workflow, context = '') {
    const systemPrompt = `
    Com base no workflow N8N fornecido, sugira melhorias específicas considerando:
    
    1. Eficiência e performance
    2. Tratamento de erros
    3. Logging e monitoramento
    4. Segurança
    5. Manutenibilidade
    6. Escalabilidade
    
    Forneça sugestões concretas com exemplos de implementação quando possível.
    `;

    const workflowStr = JSON.stringify(workflow, null, 2);
    const prompt = `${context ? `Contexto: ${context}\n\n` : ''}Workflow:\n\n${workflowStr}`;
    
    return await this.generateCompletion(systemPrompt, prompt);
  }
}

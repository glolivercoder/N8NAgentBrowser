/**
 * Storage Manager para N8N Browser Agents
 * Gerencia o armazenamento de configurações e dados sensíveis
 */

class StorageManager {
  constructor() {
    this.defaultSettings = {
      openRouterApiKey: '',
      defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
      theme: 'light',
      n8nInstances: [],
      n8nApiUrl: '',
      n8nApiKey: '',
      dockerConfig: {
        port: 5678,
        dataPath: './n8n-data',
        protocol: 'http',
        host: 'localhost'
      },
      mcpConfig: {
        playwrightRepoUrl: 'https://github.com/executeautomation/mcp-playwright.git',
        playwrightRepoPath: './mcp-playwright'
      },
      cache: {
        enabled: true,
        maxAge: 3600000, // 1 hora em milissegundos
        maxSize: 50 // número máximo de itens no cache
      }
    };
  }

  /**
   * Inicializa o storage com valores padrão se necessário
   */
  async initialize() {
    const settings = await this.getSettings();
    if (!settings) {
      await this.saveSettings(this.defaultSettings);
      return this.defaultSettings;
    }
    return settings;
  }

  /**
   * Obtém todas as configurações
   * @returns {Promise<Object>} Configurações armazenadas
   */
  async getSettings() {
    try {
      const data = await chrome.storage.local.get('settings');
      return data.settings || null;
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return null;
    }
  }

  /**
   * Salva todas as configurações
   * @param {Object} settings Configurações a serem salvas
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ settings });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  }

  /**
   * Atualiza configurações específicas
   * @param {Object} updates Atualizações a serem aplicadas
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async updateSettings(updates) {
    try {
      const currentSettings = await this.getSettings() || this.defaultSettings;
      const newSettings = this.mergeDeep(currentSettings, updates);
      return await this.saveSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  }

  /**
   * Obtém uma configuração específica
   * @param {string} key Chave da configuração
   * @returns {Promise<any>} Valor da configuração
   */
  async getSetting(key) {
    const settings = await this.getSettings();
    if (!settings) return null;

    // Suporta chaves aninhadas como 'dockerConfig.port'
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), settings);
  }

  /**
   * Salva uma configuração específica
   * @param {string} key Chave da configuração
   * @param {any} value Valor da configuração
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async setSetting(key, value) {
    try {
      const settings = await this.getSettings() || this.defaultSettings;
      
      // Suporta chaves aninhadas como 'dockerConfig.port'
      const keys = key.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((obj, k) => {
        if (!(k in obj)) obj[k] = {};
        return obj[k];
      }, settings);
      
      target[lastKey] = value;
      return await this.saveSettings(settings);
    } catch (error) {
      console.error(`Erro ao salvar configuração ${key}:`, error);
      return false;
    }
  }

  /**
   * Salva um item no cache
   * @param {string} key Chave do item
   * @param {any} value Valor a ser armazenado
   * @param {number} ttl Tempo de vida em milissegundos (opcional)
   */
  async setCacheItem(key, value, ttl = null) {
    try {
      const cache = await this.getCache();
      const settings = await this.getSettings();
      
      if (!settings.cache.enabled) return false;
      
      // Limpar cache se exceder o tamanho máximo
      if (Object.keys(cache).length >= settings.cache.maxSize) {
        // Remover o item mais antigo
        const oldestKey = Object.keys(cache).reduce((a, b) => 
          cache[a].timestamp < cache[b].timestamp ? a : b
        );
        delete cache[oldestKey];
      }
      
      const timestamp = Date.now();
      const expiresAt = ttl ? timestamp + ttl : timestamp + settings.cache.maxAge;
      
      cache[key] = {
        value,
        timestamp,
        expiresAt
      };
      
      await chrome.storage.local.set({ cache });
      return true;
    } catch (error) {
      console.error('Erro ao salvar item no cache:', error);
      return false;
    }
  }

  /**
   * Obtém um item do cache
   * @param {string} key Chave do item
   * @returns {any} Valor armazenado ou null se não existir ou estiver expirado
   */
  async getCacheItem(key) {
    try {
      const cache = await this.getCache();
      const item = cache[key];
      
      if (!item) return null;
      
      // Verificar se o item expirou
      if (Date.now() > item.expiresAt) {
        delete cache[key];
        await chrome.storage.local.set({ cache });
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Erro ao obter item do cache:', error);
      return null;
    }
  }

  /**
   * Limpa o cache inteiro ou um item específico
   * @param {string} key Chave do item a ser removido (opcional)
   */
  async clearCache(key = null) {
    try {
      if (key) {
        const cache = await this.getCache();
        delete cache[key];
        await chrome.storage.local.set({ cache });
      } else {
        await chrome.storage.local.set({ cache: {} });
      }
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Obtém todo o cache
   * @returns {Object} Cache armazenado
   */
  async getCache() {
    try {
      const data = await chrome.storage.local.get('cache');
      return data.cache || {};
    } catch (error) {
      console.error('Erro ao obter cache:', error);
      return {};
    }
  }

  /**
   * Função auxiliar para mesclar objetos profundamente
   * @private
   */
  mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  /**
   * Verifica se um valor é um objeto
   * @private
   */
  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
}

export const storageManager = new StorageManager();

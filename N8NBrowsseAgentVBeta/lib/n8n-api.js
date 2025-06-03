// n8n-api.js - N8N API Integration
export class N8NAPI {
  constructor() {
    this.baseURL = null; // Will be set during initialization
    this.apiKey = null;  // Will be set during initialization
    this.init();
  }

  async init() {
    const settings = await chrome.storage.local.get('settings');
    if (settings.settings?.n8nApiUrl) {
      this.baseURL = settings.settings.n8nApiUrl;
    }
    if (settings.settings?.n8nApiKey) {
      this.apiKey = settings.settings.n8nApiKey;
    }
  }

  async setApiConfig(apiUrl, apiKey) {
    this.baseURL = apiUrl;
    this.apiKey = apiKey;
    const settings = await chrome.storage.local.get('settings');
    await chrome.storage.local.set({
      settings: {
        ...settings.settings,
        n8nApiUrl: apiUrl,
        n8nApiKey: apiKey
      }
    });
  }

  // Helper method to handle API requests
  async _apiRequest(endpoint, method = 'GET', body = null) {
    if (!this.baseURL || !this.apiKey) {
      throw new Error('N8N API not configured. Please set API URL and key.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`N8N API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`N8N API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  // Workflow Management
  async getWorkflows() {
    return this._apiRequest('/workflows');
  }

  async getWorkflow(id) {
    return this._apiRequest(`/workflows/${id}`);
  }

  async createWorkflow(workflowData) {
    return this._apiRequest('/workflows', 'POST', workflowData);
  }

  async updateWorkflow(id, workflowData) {
    return this._apiRequest(`/workflows/${id}`, 'PATCH', workflowData);
  }

  async activateWorkflow(id) {
    return this._apiRequest(`/workflows/${id}/activate`, 'POST');
  }

  async deactivateWorkflow(id) {
    return this._apiRequest(`/workflows/${id}/deactivate`, 'POST');
  }

  async executeWorkflow(id, data = {}) {
    return this._apiRequest(`/workflows/${id}/run`, 'POST', data);
  }

  // Credentials Management
  async getCredentialTypes() {
    return this._apiRequest('/credentials/schema');
  }

  async getCredentialSchema(type) {
    return this._apiRequest(`/credentials/schema/${type}`);
  }

  async createCredential(credentialData) {
    return this._apiRequest('/credentials', 'POST', credentialData);
  }

  async getCredentials() {
    return this._apiRequest('/credentials');
  }

  // Executions Management
  async getExecutions(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    return this._apiRequest(`/executions?${queryParams.toString()}`);
  }

  async getExecution(id) {
    return this._apiRequest(`/executions/${id}`);
  }

  // Error handling and debugging
  async getWorkflowLogs(workflowId) {
    // This is a custom endpoint that might require additional implementation on the N8N side
    return this._apiRequest(`/workflows/${workflowId}/logs`);
  }

  // Test connection to N8N instance
  async testConnection() {
    try {
      await this._apiRequest('/');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

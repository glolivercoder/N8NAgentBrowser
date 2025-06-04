
/**
 * Configuração para testes da extensão N8N Browser Agents
 */
export const testConfig = {
  timeout: 10000,
  retries: 3,
  mockData: {
    apiKey: 'test-api-key-12345',
    n8nUrl: 'http://localhost:5678',
    dockerPort: 5678
  },
  endpoints: {
    openRouter: 'https://openrouter.ai/api/v1',
    n8nLocal: 'http://localhost:5678'
  }
};

export default testConfig;

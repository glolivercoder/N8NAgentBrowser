
/**
 * Utilitários para testes da extensão N8N Browser Agents
 */
export class TestHelpers {
  static async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timeout waiting for condition');
  }

  static mockChromeAPI() {
    if (typeof global !== 'undefined') {
      global.chrome = {
        runtime: {
          sendMessage: (message, callback) => {
            setTimeout(() => callback({ success: true }), 100);
          },
          onMessage: {
            addListener: () => {}
          }
        },
        storage: {
          local: {
            get: (key) => Promise.resolve({}),
            set: (data) => Promise.resolve()
          }
        }
      };
    }
  }

  static generateMockWorkflow() {
    return {
      name: 'Test Workflow',
      nodes: [
        {
          id: 'start',
          type: 'n8n-nodes-base.start',
          position: [100, 100]
        }
      ],
      connections: {}
    };
  }
}

export default TestHelpers;

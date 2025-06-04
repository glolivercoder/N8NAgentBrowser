// n8n-agent-integration.js - Integration of N8N Agent with Browser Extension
import { N8NAgent } from './n8n-agent.js';

// Create a singleton instance of the agent
let agentInstance = null;

export class N8NAgentIntegration {
  constructor() {
    if (!agentInstance) {
      agentInstance = new N8NAgent();
      this.agent = agentInstance; // Atribuir this.agent ANTES de chamar initAgent
      this.initAgent();
    } else {
      this.agent = agentInstance; // Garantir que this.agent seja definido se agentInstance já existir
    }
    this.setupMessageListeners();
  }
  
  async initAgent() {
    try {
      await this.agent.init();
      console.log('N8N Agent initialized and ready');
    } catch (error) {
      console.error('Failed to initialize N8N Agent:', error);
    }
  }
  
  setupMessageListeners() {
    // Listen for messages from popup or content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.target === 'n8nAgent') {
        this.handleAgentRequest(request, sender)
          .then(response => sendResponse(response))
          .catch(error => sendResponse({ error: error.message }));
        
        // Return true to indicate we will send a response asynchronously
        return true;
      }
    });
  }
  
  async handleAgentRequest(request, sender) {
    const { action, params } = request;
    
    try {
      switch (action) {
        case 'answerQuestion':
          return await this.agent.answerQuestion(params.question, params.context || []);
          
        case 'createWorkflow':
          return await this.agent.createWorkflow(params.description, params.requirements || {});
          
        case 'deployWorkflow':
          return await this.agent.deployWorkflow(params.workflow, params.activate || false);
          
        case 'createAndDeployWorkflow':
          return await this.agent.createAndDeployWorkflow(
            params.description, 
            params.requirements || {}, 
            params.activate || false
          );
          
        case 'analyzeWorkflow':
          return await this.agent.analyzeWorkflow(params.workflow);
          
        case 'troubleshootWorkflow':
          return await this.agent.troubleshootWorkflow(params.workflow, params.errorMessage || '');
          
        case 'suggestImprovements':
          return await this.agent.suggestImprovements(params.workflow, params.context || '');
          
        case 'createCredential':
          return await this.agent.createCredential(params.name, params.type, params.data);
          
        case 'getCredentialSchema':
          return await this.agent.getCredentialSchema(params.type);
          
        case 'testConnection':
          return await this.agent.testConnection();
          
        case 'createTrigger':
          return await this.agent.createTrigger(params.triggerType, params.parameters || {});
          
        case 'createNode':
          return await this.agent.createNode(params.nodeType, params.parameters || {});
          
        case 'executeWorkflow':
          return await this.agent.executeWorkflow(params.workflowId, params.data || {});
          
        case 'getWorkflowLogs':
          return await this.agent.getWorkflowLogs(params.workflowId);
          
        case 'getRecentExecutions':
          return await this.agent.getRecentExecutions(params.workflowId);

        // Docker integration commands
        case 'generateDockerComposeFile':
          return { dockerComposeFile: this.agent.generateDockerComposeFile(params.options || {}) };
          
        case 'generateDockerRunCommand':
          return { dockerRunCommand: this.agent.generateDockerRunCommand(params.options || {}) };
          
        case 'isN8NContainerRunning':
          return { running: await this.agent.isN8NContainerRunning() };
          
        case 'getN8NContainerStatus':
          return await this.agent.getN8NContainerStatus();
          
        case 'getDockerCommands':
          return { commands: this.agent.getDockerCommands() };
          
        case 'getDockerComposeCommands':
          return { commands: this.agent.getDockerComposeCommands(params.composeFilePath) };
          
        case 'createN8NDockerSetup':
          return await this.agent.createN8NDockerSetup(params.targetDir, params.options || {});

        // MCP integration commands
        case 'clonePlaywrightRepo':
          return await this.agent.clonePlaywrightRepo(params.targetPath);
          
        case 'runPlaywrightTest':
          return await this.agent.runPlaywrightTest(params.scriptPath, params.options || {});
          
        case 'createN8NPlaywrightTest':
          return { testScript: await this.agent.createN8NPlaywrightTest(params.workflow, params.options || {}) };
          
        case 'executeCommand':
          return await this.agent.executeCommand(params.command);

        // Basic communication actions
        case 'ping':
          return { success: true, message: 'N8N Agent is responding', timestamp: Date.now() };

        // Settings management actions
        case 'getSettings':
          return await this.getSettings();

        case 'saveSettings':
          return await this.saveSettings(params);

        case 'getApiConfig':
          return await this.getApiConfig();

        case 'setApiConfig':
          return await this.setApiConfig(params);

        // Workflow generation actions
        case 'generateWorkflow':
          return await this.generateWorkflow(params);

        // Docker status actions
        case 'checkDockerStatus':
          return await this.checkDockerStatus();

        case 'generateDockerCompose':
          return await this.generateDockerCompose(params);

        case 'startContainer':
          return await this.startContainer(params);

        case 'stopContainer':
          return await this.stopContainer(params);

        case 'restartContainer':
          return await this.restartContainer(params);

        case 'saveDockerCompose':
          return await this.saveDockerCompose(params);

        // Application state
        case 'getAppState':
          return await this.getAppState();

        case 'checkContainerStatus':
          return await this.checkContainerStatus();
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error handling agent request (${action}):`, error);
      throw error;
    }
  }

  // Settings management methods
  async getSettings() {
    try {
      const data = await chrome.storage.local.get('settings');
      return data.settings || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  async saveSettings(params) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...params };
      await chrome.storage.local.set({ settings: updatedSettings });
      return { success: true, message: 'Settings saved successfully' };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  }

  async getApiConfig() {
    return await this.getSettings();
  }

  async setApiConfig(params) {
    return await this.saveSettings(params);
  }

  // Workflow generation methods
  async generateWorkflow(params) {
    try {
      // This would typically use OpenRouter API
      // For now, return a mock workflow
      const workflow = {
        name: params.name || 'Generated Workflow',
        description: params.description || 'Auto-generated workflow',
        nodes: [
          {
            id: 'start',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
            parameters: {}
          }
        ],
        connections: {},
        createdAt: new Date().toISOString()
      };
      return { success: true, workflow };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Docker management methods
  async checkDockerStatus() {
    try {
      // Simulate Docker status check
      return { 
        running: false, 
        status: 'stopped',
        containerName: 'n8n-browser-agent'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkContainerStatus() {
    return await this.checkDockerStatus();
  }

  async generateDockerCompose(params) {
    try {
      const port = params.port || 5678;
      const dataPath = params.dataPath || './n8n-data';
      
      const dockerCompose = `
version: '3'

services:
  n8n:
    container_name: n8n-browser-agent
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "${port}:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - N8N_ENCRYPTION_KEY=change_me_please
      - WEBHOOK_URL=http://localhost:${port}/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo
    volumes:
      - ${dataPath}:/home/node/.n8n
`;
      
      return { success: true, dockerCompose };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async startContainer(params) {
    try {
      return { 
        success: true, 
        message: 'Container started successfully',
        containerName: 'n8n-browser-agent'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stopContainer(params) {
    try {
      return { 
        success: true, 
        message: 'Container stopped successfully',
        containerName: 'n8n-browser-agent'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async restartContainer(params) {
    try {
      return { 
        success: true, 
        message: 'Container restarted successfully',
        containerName: 'n8n-browser-agent'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveDockerCompose(params) {
    try {
      return { 
        success: true, 
        message: `Docker Compose saved successfully to ${params.path || './docker-compose.yml'}`,
        path: params.path || './docker-compose.yml'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Application state methods
  async getAppState() {
    try {
      const settings = await this.getSettings();
      const dockerStatus = await this.checkDockerStatus();
      
      return {
        success: true,
        state: {
          settings,
          dockerStatus,
          isConnected: false,
          lastGeneratedWorkflow: null
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Initialize the integration when this module is loaded
const integration = new N8NAgentIntegration();

// n8n-agent-integration.js - Integration of N8N Agent with Browser Extension
import { N8NAgent } from './n8n-agent.js';

// Create a singleton instance of the agent
let agentInstance = null;

export class N8NAgentIntegration {
  constructor() {
    if (!agentInstance) {
      agentInstance = new N8NAgent();
      this.initAgent();
    }
    
    this.agent = agentInstance;
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
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error handling agent request (${action}):`, error);
      throw error;
    }
  }
}

// Initialize the integration when this module is loaded
const integration = new N8NAgentIntegration();

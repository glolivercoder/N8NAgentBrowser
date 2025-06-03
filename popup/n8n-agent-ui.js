// n8n-agent-ui.js - UI component for interacting with the N8N Agent
document.addEventListener('DOMContentLoaded', () => {
  const agentUI = new N8NAgentUI();
  agentUI.init();
});

class N8NAgentUI {
  constructor() {
    this.elements = {};
    this.currentWorkflow = null;
    this.currentDockerCompose = null;
    this.currentTestScript = null;
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.checkAgentStatus();
  }

  cacheElements() {
    // Main containers
    this.elements.agentContainer = document.getElementById('n8n-agent-container');
    this.elements.questionInput = document.getElementById('agent-question-input');
    this.elements.submitButton = document.getElementById('agent-submit-button');
    this.elements.responseContainer = document.getElementById('agent-response-container');
    this.elements.loadingIndicator = document.getElementById('agent-loading-indicator');
    
    // Workflow creation elements
    this.elements.workflowDescription = document.getElementById('workflow-description-input');
    this.elements.createWorkflowButton = document.getElementById('create-workflow-button');
    this.elements.workflowResult = document.getElementById('workflow-result-container');
    
    // Docker integration elements
    this.elements.dockerPortInput = document.getElementById('docker-port-input');
    this.elements.dockerDataPathInput = document.getElementById('docker-data-path-input');
    this.elements.generateDockerComposeButton = document.getElementById('generate-docker-compose-button');
    this.elements.checkContainerStatusButton = document.getElementById('check-container-status-button');
    this.elements.startContainerButton = document.getElementById('start-container-button');
    this.elements.stopContainerButton = document.getElementById('stop-container-button');
    this.elements.dockerStatus = document.getElementById('docker-status');
    this.elements.dockerComposeContent = document.getElementById('docker-compose-content');
    this.elements.copyDockerComposeButton = document.getElementById('copy-docker-compose-button');
    this.elements.saveDockerComposeButton = document.getElementById('save-docker-compose-button');
    
    // MCP integration elements
    this.elements.playwrightRepoPathInput = document.getElementById('playwright-repo-path-input');
    this.elements.clonePlaywrightRepoButton = document.getElementById('clone-playwright-repo-button');
    this.elements.testWorkflowInput = document.getElementById('test-workflow-input');
    this.elements.generateTestScriptButton = document.getElementById('generate-test-script-button');
    this.elements.testScriptContent = document.getElementById('test-script-content');
    this.elements.copyTestScriptButton = document.getElementById('copy-test-script-button');
    this.elements.runTestScriptButton = document.getElementById('run-test-script-button');
    this.elements.commandInput = document.getElementById('command-input');
    this.elements.executeCommandButton = document.getElementById('execute-command-button');
    this.elements.commandResult = document.getElementById('command-result');
    this.elements.mcpPlaywrightUrlInput = document.getElementById('mcp-playwright-url-input');
    
    // Settings elements
    this.elements.n8nUrlInput = document.getElementById('n8n-url-input');
    this.elements.n8nApiKeyInput = document.getElementById('n8n-api-key-input');
    this.elements.saveSettingsButton = document.getElementById('save-settings-button');
    this.elements.connectionStatus = document.getElementById('connection-status');
  }

  setupEventListeners() {
    // Question answering
    this.elements.submitButton?.addEventListener('click', () => this.handleQuestionSubmit());
    this.elements.questionInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleQuestionSubmit();
    });
    
    // Workflow creation
    this.elements.createWorkflowButton?.addEventListener('click', () => this.handleWorkflowCreation());
    
    // Docker integration
    this.elements.generateDockerComposeButton?.addEventListener('click', () => this.handleGenerateDockerCompose());
    this.elements.checkContainerStatusButton?.addEventListener('click', () => this.handleCheckContainerStatus());
    this.elements.startContainerButton?.addEventListener('click', () => this.handleStartContainer());
    this.elements.stopContainerButton?.addEventListener('click', () => this.handleStopContainer());
    this.elements.copyDockerComposeButton?.addEventListener('click', () => this.copyToClipboard(this.elements.dockerComposeContent.textContent));
    this.elements.saveDockerComposeButton?.addEventListener('click', () => this.handleSaveDockerCompose());
    
    // MCP integration
    this.elements.clonePlaywrightRepoButton?.addEventListener('click', () => this.handleClonePlaywrightRepo());
    this.elements.generateTestScriptButton?.addEventListener('click', () => this.handleGenerateTestScript());
    this.elements.copyTestScriptButton?.addEventListener('click', () => this.copyToClipboard(this.elements.testScriptContent.textContent));
    this.elements.runTestScriptButton?.addEventListener('click', () => this.handleRunTestScript());
    this.elements.executeCommandButton?.addEventListener('click', () => this.handleExecuteCommand());
    
    // Settings
    this.elements.saveSettingsButton?.addEventListener('click', () => this.saveSettings());
  }

  async checkAgentStatus() {
    try {
      const response = await this.sendAgentRequest('testConnection');
      if (response.success) {
        this.updateConnectionStatus('Connected', true);
      } else {
        this.updateConnectionStatus('Not connected', false);
      }
    } catch (error) {
      this.updateConnectionStatus('Connection error', false);
      console.error('Agent status check failed:', error);
    }
  }

  updateConnectionStatus(message, isConnected) {
    if (this.elements.connectionStatus) {
      this.elements.connectionStatus.textContent = message;
      this.elements.connectionStatus.className = isConnected ? 'connected' : 'disconnected';
    }
  }

  async handleQuestionSubmit() {
    const question = this.elements.questionInput?.value.trim();
    if (!question) return;
    
    this.setLoading(true);
    this.clearResponse();
    
    try {
      const response = await this.sendAgentRequest('answerQuestion', {
        question,
        context: []
      });
      
      this.displayResponse(response);
    } catch (error) {
      this.displayError('Failed to get answer: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleWorkflowCreation() {
    const description = this.elements.workflowDescription?.value.trim();
    if (!description) return;
    
    this.setLoading(true);
    this.clearWorkflowResult();
    
    try {
      const workflow = await this.sendAgentRequest('createWorkflow', {
        description,
        requirements: {}
      });
      
      this.currentWorkflow = workflow;
      this.displayWorkflow(workflow);
    } catch (error) {
      this.displayWorkflowError('Failed to create workflow: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async deployCurrentWorkflow() {
    if (!this.currentWorkflow) {
      this.displayWorkflowError('No workflow to deploy');
      return;
    }
    
    this.setLoading(true);
    
    try {
      const result = await this.sendAgentRequest('deployWorkflow', {
        workflow: this.currentWorkflow,
        activate: true
      });
      
      this.displayDeploymentResult(result);
    } catch (error) {
      this.displayWorkflowError('Failed to deploy workflow: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async saveSettings() {
    const n8nUrl = this.elements.n8nUrlInput?.value.trim();
    const n8nApiKey = this.elements.n8nApiKeyInput?.value.trim();
    const mcpPlaywrightUrl = this.elements.mcpPlaywrightUrlInput?.value.trim();
    
    if (!n8nUrl) {
      alert('Please enter the N8N API URL');
      return;
    }
    
    try {
      await this.sendAgentRequest('setApiConfig', {
        apiUrl: n8nUrl,
        apiKey: n8nApiKey,
        mcpPlaywrightUrl: mcpPlaywrightUrl
      });
      
      alert('Settings saved successfully');
      this.checkAgentStatus();
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    }
  }

  // UI Helpers
  setLoading(isLoading) {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
    
    if (this.elements.submitButton) {
      this.elements.submitButton.disabled = isLoading;
    }
    
    if (this.elements.createWorkflowButton) {
      this.elements.createWorkflowButton.disabled = isLoading;
    }
  }

  clearResponse() {
    if (this.elements.responseContainer) {
      this.elements.responseContainer.innerHTML = '';
    }
  }

  clearWorkflowResult() {
    if (this.elements.workflowResult) {
      this.elements.workflowResult.innerHTML = '';
    }
  }

  displayResponse(response) {
    if (!this.elements.responseContainer) return;
    
    const responseDiv = document.createElement('div');
    responseDiv.className = 'agent-response';
    
    // Display the answer
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.textContent = response.answer;
    responseDiv.appendChild(answerDiv);
    
    // Display sources if available
    if (response.sources && response.sources.length > 0) {
      const sourcesDiv = document.createElement('div');
      sourcesDiv.className = 'sources';
      
      const sourcesTitle = document.createElement('h4');
      sourcesTitle.textContent = 'Sources:';
      sourcesDiv.appendChild(sourcesTitle);
      
      const sourcesList = document.createElement('ul');
      response.sources.forEach(source => {
        const sourceItem = document.createElement('li');
        sourceItem.textContent = `${source.title} (Relevance: ${Math.round(source.score * 100)}%)`;
        sourcesList.appendChild(sourceItem);
      });
      
      sourcesDiv.appendChild(sourcesList);
      responseDiv.appendChild(sourcesDiv);
    }
    
    this.elements.responseContainer.appendChild(responseDiv);
  }

  displayError(message) {
    if (!this.elements.responseContainer) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    this.elements.responseContainer.appendChild(errorDiv);
  }

  displayWorkflow(workflow) {
    if (!this.elements.workflowResult) return;
    
    const workflowDiv = document.createElement('div');
    workflowDiv.className = 'workflow-preview';
    
    // Display workflow name
    const nameDiv = document.createElement('h3');
    nameDiv.textContent = workflow.name || 'Unnamed Workflow';
    workflowDiv.appendChild(nameDiv);
    
    // Display node count
    const nodeCountDiv = document.createElement('div');
    nodeCountDiv.textContent = `Nodes: ${workflow.nodes?.length || 0}`;
    workflowDiv.appendChild(nodeCountDiv);
    
    // Add deploy button
    const deployButton = document.createElement('button');
    deployButton.textContent = 'Deploy to N8N';
    deployButton.className = 'deploy-button';
    deployButton.addEventListener('click', () => this.deployCurrentWorkflow());
    workflowDiv.appendChild(deployButton);
    
    // Add JSON preview
    const jsonPreview = document.createElement('pre');
    jsonPreview.className = 'json-preview';
    jsonPreview.textContent = JSON.stringify(workflow, null, 2);
    workflowDiv.appendChild(jsonPreview);
    
    this.elements.workflowResult.appendChild(workflowDiv);
  }

  displayWorkflowError(message) {
    if (!this.elements.workflowResult) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    this.elements.workflowResult.appendChild(errorDiv);
  }

  displayDeploymentResult(result) {
    if (!this.elements.workflowResult) return;
    
    const deploymentDiv = document.createElement('div');
    deploymentDiv.className = 'deployment-result';
    
    const titleDiv = document.createElement('h4');
    titleDiv.textContent = 'Deployment Result:';
    deploymentDiv.appendChild(titleDiv);
    
    const resultDiv = document.createElement('div');
    resultDiv.textContent = `Workflow deployed with ID: ${result.id}`;
    deploymentDiv.appendChild(resultDiv);
    
    const urlDiv = document.createElement('div');
    urlDiv.innerHTML = `<a href="${this.elements.n8nUrlInput?.value}/workflow/${result.id}" target="_blank">Open in N8N</a>`;
    deploymentDiv.appendChild(urlDiv);
    
    this.elements.workflowResult.appendChild(deploymentDiv);
  }

  // Communication with background script
  async sendAgentRequest(action, params = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          target: 'n8nAgent',
          action,
          params
        },
        response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        }
      );
    });
  }
  
  // Docker Integration Methods
  async handleGenerateDockerCompose() {
    const port = this.elements.dockerPortInput?.value.trim() || '5678';
    const dataPath = this.elements.dockerDataPathInput?.value.trim() || './n8n-data';
    
    try {
      const response = await this.sendAgentRequest('generateDockerCompose', {
        port: parseInt(port, 10),
        dataPath: dataPath,
        protocol: 'http',
        host: 'localhost'
      });
      
      if (response.dockerComposeContent) {
        this.currentDockerCompose = response.dockerComposeContent;
        this.elements.dockerComposeContent.textContent = response.dockerComposeContent;
      } else {
        this.displayDockerError('Failed to generate Docker Compose file');
      }
    } catch (error) {
      this.displayDockerError('Error: ' + error.message);
    }
  }
  
  async handleCheckContainerStatus() {
    try {
      const response = await this.sendAgentRequest('checkContainerStatus', {});
      
      if (response.status) {
        this.elements.dockerStatus.textContent = JSON.stringify(response.status, null, 2);
      } else {
        this.elements.dockerStatus.textContent = 'Container not found or not running';
      }
    } catch (error) {
      this.displayDockerError('Error checking container status: ' + error.message);
    }
  }
  
  async handleStartContainer() {
    try {
      const response = await this.sendAgentRequest('startContainer', {
        port: parseInt(this.elements.dockerPortInput?.value.trim() || '5678', 10)
      });
      
      if (response.success) {
        alert('Container started successfully');
        this.handleCheckContainerStatus();
      } else {
        this.displayDockerError('Failed to start container: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      this.displayDockerError('Error starting container: ' + error.message);
    }
  }
  
  async handleStopContainer() {
    try {
      const response = await this.sendAgentRequest('stopContainer', {});
      
      if (response.success) {
        alert('Container stopped successfully');
        this.handleCheckContainerStatus();
      } else {
        this.displayDockerError('Failed to stop container: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      this.displayDockerError('Error stopping container: ' + error.message);
    }
  }
  
  async handleSaveDockerCompose() {
    if (!this.currentDockerCompose) {
      alert('Please generate Docker Compose file first');
      return;
    }
    
    try {
      const response = await this.sendAgentRequest('saveDockerCompose', {
        content: this.currentDockerCompose,
        path: './docker-compose.yml'
      });
      
      if (response.success) {
        alert('Docker Compose file saved successfully at ' + response.path);
      } else {
        alert('Failed to save Docker Compose file: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error saving Docker Compose file: ' + error.message);
    }
  }
  
  displayDockerError(message) {
    if (this.elements.dockerStatus) {
      this.elements.dockerStatus.textContent = message;
    }
  }
  
  // MCP Integration Methods
  async handleClonePlaywrightRepo() {
    const repoPath = this.elements.playwrightRepoPathInput?.value.trim() || './mcp-playwright';
    const repoUrl = this.elements.mcpPlaywrightUrlInput?.value.trim() || 'https://github.com/executeautomation/mcp-playwright.git';
    
    try {
      const response = await this.sendAgentRequest('clonePlaywrightRepo', {
        path: repoPath,
        url: repoUrl
      });
      
      if (response.success) {
        alert('Repository cloned successfully to ' + repoPath);
      } else {
        alert('Failed to clone repository: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error cloning repository: ' + error.message);
    }
  }
  
  async handleGenerateTestScript() {
    const workflowJson = this.elements.testWorkflowInput?.value.trim();
    if (!workflowJson) {
      alert('Please enter a workflow JSON');
      return;
    }
    
    let workflow;
    try {
      workflow = JSON.parse(workflowJson);
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
      return;
    }
    
    try {
      const response = await this.sendAgentRequest('generateTestScript', {
        workflow: workflow,
        n8nUrl: this.elements.n8nUrlInput?.value.trim() || 'http://localhost:5678'
      });
      
      if (response.testScript) {
        this.currentTestScript = response.testScript;
        this.elements.testScriptContent.textContent = response.testScript;
      } else {
        this.elements.testScriptContent.textContent = 'Failed to generate test script';
      }
    } catch (error) {
      this.elements.testScriptContent.textContent = 'Error: ' + error.message;
    }
  }
  
  async handleRunTestScript() {
    if (!this.currentTestScript) {
      alert('Please generate a test script first');
      return;
    }
    
    try {
      const response = await this.sendAgentRequest('runPlaywrightTest', {
        script: this.currentTestScript
      });
      
      if (response.success) {
        alert('Test executed successfully');
        if (response.result) {
          this.elements.commandResult.textContent = JSON.stringify(response.result, null, 2);
        }
      } else {
        alert('Test execution failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error running test: ' + error.message);
    }
  }
  
  async handleExecuteCommand() {
    const command = this.elements.commandInput?.value.trim();
    if (!command) {
      alert('Please enter a command');
      return;
    }
    
    try {
      const response = await this.sendAgentRequest('executeCommand', {
        command: command
      });
      
      if (response.success) {
        this.elements.commandResult.textContent = response.output || 'Command executed successfully';
      } else {
        this.elements.commandResult.textContent = 'Command failed: ' + (response.error || 'Unknown error');
      }
    } catch (error) {
      this.elements.commandResult.textContent = 'Error: ' + error.message;
    }
  }
  
  // Utility Methods
  copyToClipboard(text) {
    if (!text) {
      alert('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard'))
      .catch(err => alert('Failed to copy: ' + err));
  }
}

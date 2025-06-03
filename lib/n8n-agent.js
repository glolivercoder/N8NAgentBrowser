// n8n-agent.js - N8N Specialized Agent
import { N8NRagSystem } from './n8n-rag-system.js';
import { N8NAPI } from './n8n-api.js';
import { N8NDockerIntegration } from './n8n-docker-integration.js';
import { MCPIntegration } from './mcp-integration.js';

export class N8NAgent {
  constructor() {
    this.ragSystem = new N8NRagSystem();
    this.n8nAPI = new N8NAPI();
    this.dockerIntegration = new N8NDockerIntegration();
    this.mcpIntegration = new MCPIntegration();
    this.initialized = false;
  }

  async init() {
    try {
      // Initialize the RAG system
      await this.ragSystem.init();
      
      // Initialize the N8N API
      await this.n8nAPI.init();
      
      // Initialize MCP integration
      await this.mcpIntegration.initialize();
      
      this.initialized = true;
      console.log('N8N Agent initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize N8N Agent:', error);
      return false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Core agent capabilities
  
  /**
   * Answer a question about N8N using the RAG system
   * @param {string} question - The user's question
   * @param {Array} context - Additional context information
   * @returns {Object} - The answer and sources
   */
  async answerQuestion(question, context = []) {
    await this.ensureInitialized();
    return await this.ragSystem.generateResponse(question, context);
  }

  /**
   * Create a new workflow based on a description
   * @param {string} description - Description of the workflow to create
   * @param {Object} requirements - Specific requirements for the workflow
   * @returns {Object} - The generated workflow JSON
   */
  async createWorkflow(description, requirements = {}) {
    await this.ensureInitialized();
    
    // Generate the workflow JSON
    const workflowJson = await this.ragSystem.generateWorkflow(description, requirements);
    
    // Parse the JSON (handle the case where it might be a string)
    let workflow;
    try {
      workflow = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson;
    } catch (error) {
      console.error('Failed to parse workflow JSON:', error);
      throw new Error('Generated workflow is not valid JSON');
    }
    
    return workflow;
  }

  /**
   * Deploy a workflow to the N8N instance
   * @param {Object} workflow - The workflow to deploy
   * @param {boolean} activate - Whether to activate the workflow after creation
   * @returns {Object} - The created workflow from the N8N API
   */
  async deployWorkflow(workflow, activate = false) {
    await this.ensureInitialized();
    
    try {
      // Create the workflow
      const createdWorkflow = await this.n8nAPI.createWorkflow(workflow);
      
      // Activate if requested
      if (activate && createdWorkflow.id) {
        await this.n8nAPI.activateWorkflow(createdWorkflow.id);
      }
      
      return createdWorkflow;
    } catch (error) {
      console.error('Failed to deploy workflow:', error);
      throw error;
    }
  }

  /**
   * Create and deploy a workflow in one step
   * @param {string} description - Description of the workflow to create
   * @param {Object} requirements - Specific requirements for the workflow
   * @param {boolean} activate - Whether to activate the workflow after creation
   * @returns {Object} - The created workflow from the N8N API
   */
  async createAndDeployWorkflow(description, requirements = {}, activate = false) {
    const workflow = await this.createWorkflow(description, requirements);
    return await this.deployWorkflow(workflow, activate);
  }

  /**
   * Analyze an existing workflow and provide insights
   * @param {Object} workflow - The workflow to analyze
   * @returns {string} - Analysis of the workflow
   */
  async analyzeWorkflow(workflow) {
    await this.ensureInitialized();
    
    // Use the OpenRouter API for analysis
    const analysis = await this.ragSystem.openRouterAPI.analyzeWorkflow(workflow);
    return analysis;
  }

  /**
   * Troubleshoot a workflow with errors
   * @param {Object} workflow - The workflow with issues
   * @param {string} errorMessage - The error message if available
   * @returns {Object} - Troubleshooting analysis and suggestions
   */
  async troubleshootWorkflow(workflow, errorMessage = '') {
    await this.ensureInitialized();
    return await this.ragSystem.troubleshootWorkflow(workflow, errorMessage);
  }

  /**
   * Suggest improvements for an existing workflow
   * @param {Object} workflow - The workflow to improve
   * @param {string} context - Additional context about improvement goals
   * @returns {string} - Suggested improvements
   */
  async suggestImprovements(workflow, context = '') {
    await this.ensureInitialized();
    
    // Use the OpenRouter API for suggestions
    const suggestions = await this.ragSystem.openRouterAPI.suggestImprovements(workflow, context);
    return suggestions;
  }

  /**
   * Create credentials for use in workflows
   * @param {string} name - Name for the credential
   * @param {string} type - Type of credential
   * @param {Object} data - Credential data
   * @returns {Object} - The created credential
   */
  async createCredential(name, type, data) {
    await this.ensureInitialized();
    
    const credentialData = {
      name,
      type,
      data
    };
    
    return await this.n8nAPI.createCredential(credentialData);
  }

  /**
   * Get the schema for a specific credential type
   * @param {string} type - Credential type
   * @returns {Object} - The credential schema
   */
  async getCredentialSchema(type) {
    await this.ensureInitialized();
    return await this.n8nAPI.getCredentialSchema(type);
  }

  /**
   * Test connection to the N8N instance
   * @returns {Object} - Connection test result
   */
  async testConnection() {
    await this.ensureInitialized();
    return await this.n8nAPI.testConnection();
  }

  /**
   * Create a trigger node configuration
   * @param {string} triggerType - Type of trigger (webhook, cron, etc.)
   * @param {Object} parameters - Trigger parameters
   * @returns {Object} - Trigger node configuration
   */
  async createTrigger(triggerType, parameters = {}) {
    await this.ensureInitialized();
    
    // Query the RAG system for information about this trigger type
    const relevantDocs = await this.ragSystem.query(`n8n trigger ${triggerType}`, 2);
    
    // Prepare the system prompt with context
    const contextText = relevantDocs.map(doc => {
      return `[${doc.title}]\n${doc.content}\n`;
    }).join('\n');
    
    const systemPrompt = `
    You are an N8N workflow expert specializing in creating triggers. 
    Create a valid trigger node configuration for a ${triggerType} trigger with the given parameters.
    
    TRIGGER CONTEXT:
    ${contextText}
    
    Return ONLY the JSON object for the trigger node configuration, with no additional text.
    The node should have a unique id, appropriate name, correct type, and all necessary parameters configured.
    `;
    
    // Generate the trigger configuration
    const triggerConfig = await this.ragSystem.openRouterAPI.generateCompletion(
      systemPrompt, 
      `Create a ${triggerType} trigger with these parameters: ${JSON.stringify(parameters, null, 2)}`,
      { temperature: 0.3 }
    );
    
    // Parse the JSON
    try {
      return JSON.parse(triggerConfig);
    } catch (error) {
      console.error('Failed to parse trigger configuration:', error);
      throw new Error('Generated trigger configuration is not valid JSON');
    }
  }

  /**
   * Generate Docker Compose file for N8N
   * @param {Object} options - Configuration options
   * @returns {string} - Docker Compose YAML content
   */
  generateDockerComposeFile(options = {}) {
    return this.dockerIntegration.generateDockerComposeFile(options);
  }

  /**
   * Generate Docker run command for N8N
   * @param {Object} options - Configuration options
   * @returns {string} - Docker run command
   */
  generateDockerRunCommand(options = {}) {
    return this.dockerIntegration.generateDockerRunCommand(options);
  }

  /**
   * Check if N8N container is running
   * @returns {Promise<boolean>} - True if container is running
   */
  async isN8NContainerRunning() {
    return await this.dockerIntegration.isContainerRunning();
  }

  /**
   * Get N8N container status
   * @returns {Promise<Object>} - Container status info
   */
  async getN8NContainerStatus() {
    return await this.dockerIntegration.getContainerStatus();
  }

  /**
   * Get Docker commands for managing N8N
   * @returns {Object} - Docker commands
   */
  getDockerCommands() {
    return this.dockerIntegration.getDockerCommands();
  }

  /**
   * Get Docker Compose commands for managing N8N
   * @param {string} composeFilePath - Path to docker-compose.yml
   * @returns {Object} - Docker Compose commands
   */
  getDockerComposeCommands(composeFilePath) {
    return this.dockerIntegration.getDockerComposeCommands(composeFilePath);
  }

  /**
   * Clone the MCP Playwright repository
   * @param {string} targetPath - Path to clone to
   * @returns {Promise<Object>} - Result of the operation
   */
  async clonePlaywrightRepo(targetPath) {
    return await this.mcpIntegration.clonePlaywrightRepo(targetPath);
  }

  /**
   * Run a Playwright test script
   * @param {string} scriptPath - Path to the test script
   * @param {Object} options - Test options
   * @returns {Promise<Object>} - Test results
   */
  async runPlaywrightTest(scriptPath, options = {}) {
    return await this.mcpIntegration.runPlaywrightTest(scriptPath, options);
  }

  /**
   * Create a Playwright test script for N8N
   * @param {Object} workflow - N8N workflow to test
   * @param {Object} options - Test options
   * @returns {Promise<string>} - Generated test script
   */
  async createN8NPlaywrightTest(workflow, options = {}) {
    return await this.mcpIntegration.createN8NPlaywrightTest(workflow, options);
  }

  /**
   * Execute a command using MCP
   * @param {string} command - Command to execute
   * @returns {Promise<Object>} - Command result
   */
  async executeCommand(command) {
    return await this.mcpIntegration.executeCommand(command);
  }

  /**
   * Create a Docker Compose setup for N8N
   * @param {string} targetDir - Target directory
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Result of the operation
   */
  async createN8NDockerSetup(targetDir, options = {}) {
    return await this.mcpIntegration.createN8NDockerSetup(targetDir, options);
  }

  /**
   * Create a node configuration
   * @param {string} nodeType - Type of node
   * @param {Object} parameters - Node parameters
   * @returns {Object} - Node configuration
   */
  async createNode(nodeType, parameters = {}) {
    await this.ensureInitialized();
    
    // Query the RAG system for information about this node type
    const relevantDocs = await this.ragSystem.query(`n8n node ${nodeType}`, 2);
    
    // Prepare the system prompt with context
    const contextText = relevantDocs.map(doc => {
      return `[${doc.title}]\n${doc.content}\n`;
    }).join('\n');
    
    const systemPrompt = `
    You are an N8N workflow expert specializing in creating nodes. 
    Create a valid node configuration for a ${nodeType} node with the given parameters.
    
    NODE CONTEXT:
    ${contextText}
    
    Return ONLY the JSON object for the node configuration, with no additional text.
    The node should have a unique id, appropriate name, correct type, and all necessary parameters configured.
    `;
    
    // Generate the node configuration
    const nodeConfig = await this.ragSystem.openRouterAPI.generateCompletion(
      systemPrompt, 
      `Create a ${nodeType} node with these parameters: ${JSON.stringify(parameters, null, 2)}`,
      { temperature: 0.3 }
    );
    
    // Parse the JSON
    try {
      return JSON.parse(nodeConfig);
    } catch (error) {
      console.error('Failed to parse node configuration:', error);
      throw new Error('Generated node configuration is not valid JSON');
    }
  }

  /**
   * Add a document to the knowledge base
   * @param {Object} document - The document to add
   * @returns {string} - The ID of the added document
   */
  async addToKnowledgeBase(document) {
    await this.ensureInitialized();
    return await this.ragSystem.addToKnowledgeBase(document);
  }

  /**
   * Get workflow execution logs
   * @param {string} workflowId - ID of the workflow
   * @returns {Array} - Execution logs
   */
  async getWorkflowLogs(workflowId) {
    await this.ensureInitialized();
    return await this.n8nAPI.getWorkflowLogs(workflowId);
  }

  /**
   * Get recent executions for a workflow
   * @param {string} workflowId - ID of the workflow
   * @returns {Array} - Recent executions
   */
  async getRecentExecutions(workflowId) {
    await this.ensureInitialized();
    return await this.n8nAPI.getExecutions({ workflowId });
  }

  /**
   * Execute a workflow manually
   * @param {string} workflowId - ID of the workflow
   * @param {Object} data - Input data for the workflow
   * @returns {Object} - Execution result
   */
  async executeWorkflow(workflowId, data = {}) {
    await this.ensureInitialized();
    return await this.n8nAPI.executeWorkflow(workflowId, data);
  }
}

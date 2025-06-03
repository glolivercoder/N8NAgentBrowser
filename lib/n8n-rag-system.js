// n8n-rag-system.js - Local RAG System for N8N Agent
import { OpenRouterAPI } from '../openrouter-api.js';

export class N8NRagSystem {
  constructor() {
    this.openRouterAPI = new OpenRouterAPI();
    this.knowledgeBase = null;
    this.vectorStore = null;
    this.initialized = false;
    this.embeddingCache = new Map();
  }

  async init() {
    try {
      // Load the knowledge base
      await this.loadKnowledgeBase();
      
      // Initialize the vector store
      await this.initVectorStore();
      
      this.initialized = true;
      console.log('N8N RAG System initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize N8N RAG System:', error);
      return false;
    }
  }

  async loadKnowledgeBase() {
    // Load the knowledge base from storage or initialize with default data
    const stored = await chrome.storage.local.get('n8nKnowledgeBase');
    
    if (stored.n8nKnowledgeBase) {
      this.knowledgeBase = stored.n8nKnowledgeBase;
      console.log('Loaded existing knowledge base with', this.knowledgeBase.length, 'documents');
    } else {
      // Initialize with default knowledge
      this.knowledgeBase = [
        // API Endpoints
        {
          id: 'api-workflows',
          title: 'N8N Workflow API Endpoints',
          content: `
            # N8N Workflow API Endpoints
            
            ## Create Workflow
            - Method: POST
            - Endpoint: /workflows
            - Description: Creates a new workflow with JSON configuration
            - Required fields: name, nodes, connections
            
            ## Update Workflow
            - Method: PATCH
            - Endpoint: /workflows/{id}
            - Description: Updates an existing workflow
            
            ## Activate Workflow
            - Method: POST
            - Endpoint: /workflows/{id}/activate
            - Description: Activates a workflow for automatic execution
            
            ## Deactivate Workflow
            - Method: POST
            - Endpoint: /workflows/{id}/deactivate
            - Description: Deactivates a workflow
            
            ## Execute Workflow
            - Method: POST
            - Endpoint: /workflows/{id}/run
            - Description: Executes a workflow manually
          `,
          category: 'api',
          tags: ['workflow', 'api', 'endpoints']
        },
        {
          id: 'api-credentials',
          title: 'N8N Credentials API Endpoints',
          content: `
            # N8N Credentials API Endpoints
            
            ## Create Credential
            - Method: POST
            - Endpoint: /credentials
            - Description: Creates and stores credentials for use in nodes
            - Required fields: name, type, data
            
            ## Get Credential Schema
            - Method: GET
            - Endpoint: /credentials/schema/{credentialType}
            - Description: Returns the fields needed for a specific credential type
          `,
          category: 'api',
          tags: ['credentials', 'api', 'endpoints']
        },
        // Triggers
        {
          id: 'triggers-overview',
          title: 'N8N Triggers Overview',
          content: `
            # N8N Triggers Overview
            
            Triggers are special nodes that start a workflow execution. They are configured in the workflow JSON.
            
            ## Common Trigger Types:
            
            ### Webhook Trigger
            - Listens for HTTP requests
            - Can be configured for specific methods (GET, POST, etc.)
            - Supports authentication
            
            ### Cron Trigger
            - Executes workflow on a schedule
            - Uses cron syntax (e.g., "0 0 * * *" for daily at midnight)
            
            ### N8N Trigger
            - Responds to internal N8N events
            - Events include: "Workflow activated", "Workflow updated", "Instance started"
            
            ### Manual Trigger
            - Starts workflow manually via UI or API
            
            ## Trigger Configuration Example:
            
            \`\`\`json
            {
              "id": "123abc",
              "name": "Webhook",
              "type": "n8n-nodes-base.webhook",
              "typeVersion": 1,
              "position": [250, 300],
              "parameters": {
                "path": "my-webhook",
                "responseMode": "onReceived",
                "options": {}
              }
            }
            \`\`\`
          `,
          category: 'triggers',
          tags: ['triggers', 'webhook', 'cron', 'configuration']
        },
        // Nodes
        {
          id: 'nodes-overview',
          title: 'N8N Nodes Overview',
          content: `
            # N8N Nodes Overview
            
            Nodes are the building blocks of N8N workflows. Each node performs a specific action or operation.
            
            ## Node Structure in Workflow JSON:
            
            \`\`\`json
            {
              "id": "unique-id",
              "name": "Node Name",
              "type": "node-type",
              "typeVersion": 1,
              "position": [x, y],
              "parameters": {
                // Node-specific parameters
              }
            }
            \`\`\`
            
            ## Common Node Types:
            
            ### HTTP Request
            - Makes HTTP requests to external APIs
            - Supports all HTTP methods
            - Can handle authentication
            
            ### Function
            - Executes custom JavaScript code
            - Processes data with custom logic
            
            ### Set
            - Sets values in the workflow data
            - Can create new fields or modify existing ones
            
            ### IF
            - Conditional branching
            - Routes workflow based on conditions
            
            ### Switch
            - Multi-way conditional branching
            - Routes based on multiple possible values
            
            ### Merge
            - Combines data from multiple branches
            - Different merge modes available
          `,
          category: 'nodes',
          tags: ['nodes', 'configuration', 'types']
        },
        // Workflows
        {
          id: 'workflow-structure',
          title: 'N8N Workflow Structure',
          content: `
            # N8N Workflow Structure
            
            A complete N8N workflow is defined by a JSON structure with the following components:
            
            ## Basic Structure:
            
            \`\`\`json
            {
              "name": "Workflow Name",
              "nodes": [
                // Array of node objects
              ],
              "connections": {
                // Defines how nodes are connected
              },
              "active": true,
              "settings": {
                "executionOrder": "v1"
              },
              "versionId": "1"
            }
            \`\`\`
            
            ## Connections Format:
            
            \`\`\`json
            "connections": {
              "Node A": {
                "main": [
                  [
                    {
                      "node": "Node B",
                      "type": "main",
                      "index": 0
                    }
                  ]
                ]
              },
              "Node B": {
                "main": [
                  [
                    {
                      "node": "Node C",
                      "type": "main",
                      "index": 0
                    }
                  ]
                ]
              }
            }
            \`\`\`
            
            This structure defines that Node A's output connects to Node B's input, and Node B's output connects to Node C's input.
          `,
          category: 'workflows',
          tags: ['workflow', 'structure', 'json', 'configuration']
        },
        // Troubleshooting
        {
          id: 'common-errors',
          title: 'Common N8N Errors and Solutions',
          content: `
            # Common N8N Errors and Solutions
            
            ## Authentication Errors
            
            ### Error: "Authentication failed"
            - Check if the credential is correctly configured
            - Verify API keys or tokens are valid and not expired
            - Ensure the credential type matches the service requirements
            
            ## Workflow Execution Errors
            
            ### Error: "Workflow could not be activated"
            - Check if all nodes are properly configured
            - Verify that trigger nodes have all required parameters
            - Check for circular references in the workflow
            
            ### Error: "Execution failed"
            - Check the execution logs for specific error messages
            - Verify that all services and APIs are accessible
            - Check for rate limiting or quota issues with external services
            
            ## Node Configuration Errors
            
            ### Error: "Required parameter missing"
            - Identify the node with the error
            - Check the node's documentation for required parameters
            - Add the missing parameters to the node configuration
            
            ### Error: "Invalid JSON in Function node"
            - Check the JavaScript code for syntax errors
            - Verify that all brackets and parentheses are balanced
            - Test the code in isolation before using in the workflow
            
            ## Connection Issues
            
            ### Error: "Could not connect to service"
            - Check network connectivity
            - Verify firewall settings
            - Ensure the service endpoint is correct and accessible
            
            ## Data Transformation Issues
            
            ### Error: "Cannot read property of undefined"
            - Use the IF node to check if data exists before processing
            - Add error handling for missing data
            - Use the Set node to provide default values
          `,
          category: 'troubleshooting',
          tags: ['errors', 'troubleshooting', 'solutions']
        },
        // Best Practices
        {
          id: 'best-practices',
          title: 'N8N Workflow Best Practices',
          content: `
            # N8N Workflow Best Practices
            
            ## Error Handling
            
            - Add Error Trigger nodes to handle workflow failures
            - Use Try/Catch nodes for critical operations
            - Implement notification mechanisms for failures (email, Slack, etc.)
            
            ## Performance Optimization
            
            - Minimize the number of HTTP requests
            - Use batch processing when possible
            - Implement caching for frequently accessed data
            - Use the Function node for complex data transformations instead of multiple Set nodes
            
            ## Security
            
            - Store sensitive data in credentials, not in workflow parameters
            - Use webhook authentication when exposing endpoints
            - Implement rate limiting for public-facing webhooks
            - Regularly rotate API keys and tokens
            
            ## Maintainability
            
            - Use descriptive names for nodes and workflows
            - Add comments to complex Function nodes
            - Organize workflows into logical groups
            - Version control your workflows using exports
            
            ## Testing
            
            - Test workflows with sample data before activating
            - Create test workflows for critical components
            - Use the Test & Debug feature to validate workflow execution
            - Monitor execution times and optimize slow-running nodes
          `,
          category: 'best-practices',
          tags: ['best-practices', 'optimization', 'security']
        },
        // MSPCs Integration
        {
          id: 'mspc-integration',
          title: 'Integrating MSPCs with N8N',
          content: `
            # Integrating MSPCs with N8N
            
            ## MSPC Connection Methods
            
            ### HTTP API Integration
            - Use the HTTP Request node to connect to MSPC APIs
            - Configure authentication using API keys or OAuth
            - Map MSPC data structures to N8N workflow data
            
            ### Database Integration
            - Use database nodes (MySQL, PostgreSQL, etc.) to connect to MSPC databases
            - Implement read/write operations for data synchronization
            - Use transactions for data integrity
            
            ### Webhook Integration
            - Configure MSPC to send webhooks to N8N
            - Use the Webhook node as a trigger
            - Process incoming MSPC event data
            
            ## Common MSPC Integration Patterns
            
            ### Data Synchronization
            - Set up scheduled workflows to sync data between systems
            - Implement delta sync to minimize data transfer
            - Add error handling and retry logic
            
            ### Event-Driven Integration
            - Configure MSPC to send events to N8N webhooks
            - Process events in real-time
            - Implement event filtering and routing
            
            ### Service Orchestration
            - Use N8N as a central orchestrator for multiple MSPCs
            - Implement complex business logic across systems
            - Maintain state and handle long-running processes
          `,
          category: 'integration',
          tags: ['mspc', 'integration', 'api', 'webhook']
        }
      ];
      
      // Save the initial knowledge base to storage
      await chrome.storage.local.set({ n8nKnowledgeBase: this.knowledgeBase });
      console.log('Initialized default knowledge base with', this.knowledgeBase.length, 'documents');
    }
  }

  async initVectorStore() {
    // Initialize the vector store with the knowledge base
    // This is a simple implementation using cosine similarity
    this.vectorStore = [];
    
    // Process each document in the knowledge base
    for (const doc of this.knowledgeBase) {
      // Get or generate embedding for the document
      const embedding = await this.getEmbedding(doc.content);
      
      // Store the document with its embedding
      this.vectorStore.push({
        id: doc.id,
        embedding,
        metadata: {
          title: doc.title,
          category: doc.category,
          tags: doc.tags
        }
      });
    }
    
    console.log('Vector store initialized with', this.vectorStore.length, 'documents');
  }

  async getEmbedding(text) {
    // Check if we have a cached embedding for this text
    const cacheKey = this.hashString(text);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }
    
    // For this implementation, we'll use a simple TF-IDF like approach
    // In a production system, you would use a proper embedding model
    
    // Preprocess the text
    const processedText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
      .trim();
    
    // Split into tokens
    const tokens = processedText.split(' ');
    
    // Count token frequencies
    const tokenCounts = {};
    tokens.forEach(token => {
      if (token.length > 1) { // Ignore single-character tokens
        tokenCounts[token] = (tokenCounts[token] || 0) + 1;
      }
    });
    
    // Create a simple embedding (just the token counts)
    // In a real system, this would be a dense vector from a model
    const embedding = tokenCounts;
    
    // Cache the embedding
    this.embeddingCache.set(cacheKey, embedding);
    
    return embedding;
  }

  hashString(str) {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async query(question, topK = 3) {
    if (!this.initialized) {
      await this.init();
    }
    
    // Get embedding for the question
    const questionEmbedding = await this.getEmbedding(question);
    
    // Calculate similarity scores with all documents
    const scoredDocs = this.vectorStore.map(doc => {
      const similarity = this.calculateCosineSimilarity(questionEmbedding, doc.embedding);
      return {
        id: doc.id,
        score: similarity,
        metadata: doc.metadata
      };
    });
    
    // Sort by similarity score (descending)
    scoredDocs.sort((a, b) => b.score - a.score);
    
    // Get the top K results
    const topResults = scoredDocs.slice(0, topK);
    
    // Fetch the full documents for the top results
    const retrievedDocs = topResults.map(result => {
      const doc = this.knowledgeBase.find(d => d.id === result.id);
      return {
        ...doc,
        score: result.score
      };
    });
    
    return retrievedDocs;
  }

  calculateCosineSimilarity(embedding1, embedding2) {
    // Get all unique keys from both embeddings
    const allKeys = new Set([...Object.keys(embedding1), ...Object.keys(embedding2)]);
    
    // Calculate dot product
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    allKeys.forEach(key => {
      const val1 = embedding1[key] || 0;
      const val2 = embedding2[key] || 0;
      
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  async addToKnowledgeBase(document) {
    // Add a new document to the knowledge base
    if (!document.id) {
      document.id = `doc-${Date.now()}`;
    }
    
    // Add the document to the knowledge base
    this.knowledgeBase.push(document);
    
    // Update the vector store
    const embedding = await this.getEmbedding(document.content);
    this.vectorStore.push({
      id: document.id,
      embedding,
      metadata: {
        title: document.title,
        category: document.category,
        tags: document.tags
      }
    });
    
    // Save the updated knowledge base to storage
    await chrome.storage.local.set({ n8nKnowledgeBase: this.knowledgeBase });
    
    console.log(`Added document "${document.title}" to knowledge base`);
    return document.id;
  }

  async removeFromKnowledgeBase(documentId) {
    // Remove a document from the knowledge base
    const initialLength = this.knowledgeBase.length;
    
    // Remove from knowledge base
    this.knowledgeBase = this.knowledgeBase.filter(doc => doc.id !== documentId);
    
    // Remove from vector store
    this.vectorStore = this.vectorStore.filter(doc => doc.id !== documentId);
    
    // Save the updated knowledge base to storage
    await chrome.storage.local.set({ n8nKnowledgeBase: this.knowledgeBase });
    
    const removed = initialLength > this.knowledgeBase.length;
    console.log(`Document ${documentId} ${removed ? 'removed from' : 'not found in'} knowledge base`);
    
    return removed;
  }

  async generateResponse(question, context = []) {
    if (!this.initialized) {
      await this.init();
    }
    
    // Query the knowledge base for relevant documents
    const relevantDocs = await this.query(question, 3);
    
    // Prepare the context from the retrieved documents
    const contextText = relevantDocs.map(doc => {
      return `[${doc.title}]\n${doc.content}\n`;
    }).join('\n');
    
    // Additional context provided by the caller
    const additionalContext = context.join('\n');
    
    // Prepare the system prompt
    const systemPrompt = `
    You are an N8N workflow expert specializing in creating triggers, integrating MSPCs, creating and managing workflows, 
    nodes, credentials, and troubleshooting workflow issues. Use the following information to answer the user's question.
    
    CONTEXT INFORMATION:
    ${contextText}
    
    ${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ''}
    
    Answer the user's question based on the provided context. If you don't know the answer, say so clearly.
    Provide specific, actionable advice when possible, including code snippets or configuration examples when relevant.
    `;
    
    // Generate the response using OpenRouter
    const response = await this.openRouterAPI.generateCompletion(systemPrompt, question, {
      temperature: 0.3,
      maxTokens: 2000
    });
    
    return {
      answer: response,
      sources: relevantDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        score: doc.score
      }))
    };
  }

  // Method to handle specific N8N workflow creation
  async generateWorkflow(description, requirements = {}) {
    // Query the knowledge base for relevant documents about workflow structure and nodes
    const relevantDocs = await this.query(`workflow structure nodes ${description}`, 3);
    
    // Prepare context from relevant documents
    const contextText = relevantDocs.map(doc => {
      return `[${doc.title}]\n${doc.content}\n`;
    }).join('\n');
    
    // Use the OpenRouter API to generate the workflow
    return await this.openRouterAPI.generateN8NWorkflow(description, requirements);
  }

  // Method to analyze and troubleshoot workflow issues
  async troubleshootWorkflow(workflow, errorMessage = '') {
    // Query the knowledge base for relevant troubleshooting documents
    const relevantDocs = await this.query(`workflow error troubleshooting ${errorMessage}`, 3);
    
    // Prepare context from relevant documents
    const contextText = relevantDocs.map(doc => {
      return `[${doc.title}]\n${doc.content}\n`;
    }).join('\n');
    
    // Prepare the system prompt
    const systemPrompt = `
    You are an N8N workflow troubleshooting expert. Analyze the workflow and error message provided, 
    and suggest solutions to fix the issues.
    
    TROUBLESHOOTING CONTEXT:
    ${contextText}
    
    ERROR MESSAGE:
    ${errorMessage}
    
    Provide a detailed analysis of the workflow issues and specific steps to resolve them.
    Include code snippets or configuration examples when relevant.
    `;
    
    const workflowStr = JSON.stringify(workflow, null, 2);
    
    // Generate the troubleshooting response
    const response = await this.openRouterAPI.generateCompletion(systemPrompt, `Workflow for troubleshooting:\n\n${workflowStr}`, {
      temperature: 0.3,
      maxTokens: 2000
    });
    
    return {
      analysis: response,
      sources: relevantDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        score: doc.score
      }))
    };
  }
}

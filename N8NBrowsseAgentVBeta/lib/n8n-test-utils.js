// n8n-test-utils.js - Utilities for testing the N8N Agent
export class N8NTestUtils {
  /**
   * Get a sample workflow for testing
   * @param {string} type - Type of sample workflow
   * @returns {Object} - Sample workflow JSON
   */
  static getSampleWorkflow(type = 'webhook') {
    const samples = {
      webhook: {
        name: "Webhook to Slack Notification",
        nodes: [
          {
            id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: "notification",
              responseMode: "onReceived",
              options: {}
            }
          },
          {
            id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
            name: "Slack",
            type: "n8n-nodes-base.slack",
            typeVersion: 1,
            position: [500, 300],
            parameters: {
              token: "={{ $credentials.slackApi }}",
              channel: "notifications",
              text: "=Novo webhook recebido com os seguintes dados:\n\n{{ JSON.stringify($json, null, 2) }}",
              otherOptions: {
                attachments: []
              }
            }
          }
        ],
        connections: {
          "Webhook": {
            main: [
              [
                {
                  node: "Slack",
                  type: "main",
                  index: 0
                }
              ]
            ]
          }
        },
        active: true,
        settings: {
          executionOrder: "v1"
        },
        versionId: "1"
      },
      
      cron: {
        name: "Daily Database Backup",
        nodes: [
          {
            id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
            name: "Cron",
            type: "n8n-nodes-base.cron",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              triggerTimes: {
                item: [
                  {
                    mode: "everyDay"
                  }
                ]
              }
            }
          },
          {
            id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
            name: "PostgreSQL",
            type: "n8n-nodes-base.postgres",
            typeVersion: 1,
            position: [500, 300],
            parameters: {
              operation: "executeQuery",
              query: "BACKUP DATABASE my_database TO DISK = '/backups/my_database_{{ $now.format('YYYY-MM-DD') }}.bak'",
              credentials: {
                postgres: "={{ $credentials.postgres }}"
              }
            }
          },
          {
            id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
            name: "Send Email",
            type: "n8n-nodes-base.emailSend",
            typeVersion: 1,
            position: [750, 300],
            parameters: {
              fromEmail: "backup@example.com",
              toEmail: "admin@example.com",
              subject: "Database Backup Completed - {{ $now.format('YYYY-MM-DD') }}",
              text: "The daily database backup has been completed successfully.",
              credentials: {
                smtp: "={{ $credentials.smtp }}"
              }
            }
          }
        ],
        connections: {
          "Cron": {
            main: [
              [
                {
                  node: "PostgreSQL",
                  type: "main",
                  index: 0
                }
              ]
            ]
          },
          "PostgreSQL": {
            main: [
              [
                {
                  node: "Send Email",
                  type: "main",
                  index: 0
                }
              ]
            ]
          }
        },
        active: true,
        settings: {
          executionOrder: "v1"
        },
        versionId: "1"
      },
      
      error: {
        name: "Error Handling Example",
        nodes: [
          {
            id: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {}
          },
          {
            id: "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
            name: "HTTP Request",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 1,
            position: [500, 300],
            parameters: {
              url: "https://invalid-url-for-testing.xyz",
              method: "GET",
              authentication: "none",
              options: {}
            }
          },
          {
            id: "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
            name: "Error Handler",
            type: "n8n-nodes-base.noOp",
            typeVersion: 1,
            position: [750, 450],
            parameters: {}
          },
          {
            id: "9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
            name: "Slack Error",
            type: "n8n-nodes-base.slack",
            typeVersion: 1,
            position: [1000, 450],
            parameters: {
              token: "={{ $credentials.slackApi }}",
              channel: "errors",
              text: "=Error in workflow: {{ $workflow.name }}\n\nError: {{ $json.error }}",
              otherOptions: {
                attachments: []
              }
            }
          }
        ],
        connections: {
          "Manual Trigger": {
            main: [
              [
                {
                  node: "HTTP Request",
                  type: "main",
                  index: 0
                }
              ]
            ]
          },
          "HTTP Request": {
            error: [
              [
                {
                  node: "Error Handler",
                  type: "main",
                  index: 0
                }
              ]
            ]
          },
          "Error Handler": {
            main: [
              [
                {
                  node: "Slack Error",
                  type: "main",
                  index: 0
                }
              ]
            ]
          }
        },
        active: true,
        settings: {
          executionOrder: "v1"
        },
        versionId: "1"
      }
    };
    
    return samples[type] || samples.webhook;
  }
  
  /**
   * Get a sample error message for testing troubleshooting
   * @param {string} type - Type of error
   * @returns {string} - Sample error message
   */
  static getSampleErrorMessage(type = 'connection') {
    const errors = {
      connection: "Error: connect ECONNREFUSED 127.0.0.1:5432 - Unable to connect to the database server",
      authentication: "Error: Authentication failed. Please check your API key or credentials",
      timeout: "Error: Request timed out after 30000ms",
      validation: "Error: Required parameter 'channel' is missing in Slack node",
      permission: "Error: Insufficient permissions to access resource"
    };
    
    return errors[type] || errors.connection;
  }
  
  /**
   * Get sample credential data for testing
   * @param {string} type - Type of credential
   * @returns {Object} - Sample credential data
   */
  static getSampleCredential(type = 'slack') {
    const credentials = {
      slack: {
        name: "Slack API",
        type: "slackApi",
        data: {
          accessToken: "xoxb-sample-token-123456"
        }
      },
      postgres: {
        name: "PostgreSQL",
        type: "postgres",
        data: {
          host: "localhost",
          port: 5432,
          database: "my_database",
          user: "postgres",
          password: "postgres"
        }
      },
      smtp: {
        name: "SMTP",
        type: "smtp",
        data: {
          host: "smtp.example.com",
          port: 587,
          user: "notifications@example.com",
          password: "smtp-password",
          ssl: true
        }
      }
    };
    
    return credentials[type] || credentials.slack;
  }
  
  /**
   * Get sample requirements for workflow generation
   * @param {string} type - Type of requirements
   * @returns {Object} - Sample requirements
   */
  static getSampleRequirements(type = 'basic') {
    const requirements = {
      basic: {
        triggerType: "webhook",
        includeErrorHandling: true,
        outputType: "slack"
      },
      advanced: {
        triggerType: "cron",
        schedule: "0 0 * * *", // Daily at midnight
        dataProcessing: {
          type: "database",
          operation: "backup"
        },
        notification: {
          type: "email",
          recipients: ["admin@example.com"]
        },
        errorHandling: {
          retryAttempts: 3,
          notifyOnError: true
        }
      },
      integration: {
        services: ["github", "slack", "google-sheets"],
        triggerType: "github-webhook",
        eventType: "push",
        dataMapping: {
          commitMessage: "slackMessage",
          authorName: "spreadsheetColumn"
        }
      }
    };
    
    return requirements[type] || requirements.basic;
  }
  
  /**
   * Generate a test query for the RAG system
   * @param {string} type - Type of query
   * @returns {string} - Sample query
   */
  static getSampleQuery(type = 'workflow') {
    const queries = {
      workflow: "Como criar um workflow que monitora um email e envia notificações no Slack quando recebe anexos?",
      trigger: "Quais são os diferentes tipos de triggers disponíveis no N8N e como configurá-los?",
      node: "Como configurar um nó HTTP Request para fazer chamadas autenticadas a uma API REST?",
      credentials: "Como criar e gerenciar credenciais de forma segura no N8N?",
      error: "Estou recebendo um erro 'Authentication failed' no nó Slack. Como posso resolver isso?",
      mspc: "Como integrar o N8N com um sistema MSPC para sincronização de dados?"
    };
    
    return queries[type] || queries.workflow;
  }
}

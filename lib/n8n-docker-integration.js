// n8n-docker-integration.js - Docker integration for N8N
export class N8NDockerIntegration {
  constructor() {
    this.containerName = 'n8n-browser-agent';
    this.defaultPort = 5678;
    this.defaultProtocol = 'http';
    this.defaultHost = 'localhost';
  }

  /**
   * Generate a Docker Compose file for N8N
   * @param {Object} options - Configuration options
   * @returns {string} - Docker Compose YAML content
   */
  generateDockerComposeFile(options = {}) {
    const port = options.port || this.defaultPort;
    const protocol = options.protocol || this.defaultProtocol;
    const host = options.host || this.defaultHost;
    const dataPath = options.dataPath || './n8n-data';
    
    return `
version: '3'

services:
  n8n:
    container_name: ${this.containerName}
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "${port}:5678"
    environment:
      - N8N_HOST=${host}
      - N8N_PORT=5678
      - N8N_PROTOCOL=${protocol}
      - NODE_ENV=production
      - N8N_ENCRYPTION_KEY=change_me_please
      - WEBHOOK_URL=${protocol}://${host}:${port}/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo
    volumes:
      - ${dataPath}:/home/node/.n8n
`;
  }

  /**
   * Generate a Docker run command for N8N
   * @param {Object} options - Configuration options
   * @returns {string} - Docker run command
   */
  generateDockerRunCommand(options = {}) {
    const port = options.port || this.defaultPort;
    const protocol = options.protocol || this.defaultProtocol;
    const host = options.host || this.defaultHost;
    const dataPath = options.dataPath || './n8n-data';
    
    return `docker run -d \\
  --name ${this.containerName} \\
  -p ${port}:5678 \\
  -e N8N_HOST=${host} \\
  -e N8N_PORT=5678 \\
  -e N8N_PROTOCOL=${protocol} \\
  -e NODE_ENV=production \\
  -e N8N_ENCRYPTION_KEY=change_me_please \\
  -e WEBHOOK_URL=${protocol}://${host}:${port}/ \\
  -e GENERIC_TIMEZONE=America/Sao_Paulo \\
  -e TZ=America/Sao_Paulo \\
  -v ${dataPath}:/home/node/.n8n \\
  n8nio/n8n:latest`;
  }

  /**
   * Check if N8N container is running
   * @returns {Promise<boolean>} - True if container is running
   */
  async isContainerRunning() {
    try {
      // This would normally execute a Docker command, but in a browser extension
      // we need to use native messaging or another approach to interact with Docker
      // For now, we'll simulate this with a fetch request to the N8N instance
      const response = await fetch(`${this.defaultProtocol}://${this.defaultHost}:${this.defaultPort}/healthz`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking N8N container status:', error);
      return false;
    }
  }

  /**
   * Get container status information
   * @returns {Promise<Object>} - Container status info
   */
  async getContainerStatus() {
    try {
      // In a real implementation, this would use Docker API
      // For now, we'll simulate with a health check
      const isRunning = await this.isContainerRunning();
      
      return {
        running: isRunning,
        name: this.containerName,
        url: isRunning ? `${this.defaultProtocol}://${this.defaultHost}:${this.defaultPort}` : null,
        status: isRunning ? 'running' : 'stopped'
      };
    } catch (error) {
      console.error('Error getting container status:', error);
      return {
        running: false,
        name: this.containerName,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get Docker commands for managing N8N
   * @returns {Object} - Docker commands
   */
  getDockerCommands() {
    return {
      start: `docker start ${this.containerName}`,
      stop: `docker stop ${this.containerName}`,
      restart: `docker restart ${this.containerName}`,
      logs: `docker logs ${this.containerName}`,
      remove: `docker rm -f ${this.containerName}`
    };
  }

  /**
   * Get Docker Compose commands for managing N8N
   * @param {string} composeFilePath - Path to docker-compose.yml
   * @returns {Object} - Docker Compose commands
   */
  getDockerComposeCommands(composeFilePath = './docker-compose.yml') {
    return {
      up: `docker-compose -f ${composeFilePath} up -d`,
      down: `docker-compose -f ${composeFilePath} down`,
      restart: `docker-compose -f ${composeFilePath} restart`,
      logs: `docker-compose -f ${composeFilePath} logs`,
      pull: `docker-compose -f ${composeFilePath} pull`
    };
  }
}

// n8n-docker-integration.js - Docker integration for N8N
export class N8NDockerIntegration {
  constructor() {
    this.containerName = 'n8n-browser-agent';
    this.defaultPort = 5678;
    this.defaultProtocol = 'http';
    this.defaultHost = 'localhost';
    this.logListeners = [];
    this.statusListeners = [];
    this.monitoringInterval = null;
    this.logTailSize = 100; // Número de linhas de log para buscar
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

  /**
   * Get container logs
   * @param {Object} options - Options for log retrieval
   * @param {number} options.tail - Number of lines to retrieve (default: 100)
   * @param {boolean} options.follow - Whether to follow logs (default: false)
   * @returns {Promise<string>} - Container logs
   */
  async getContainerLogs(options = {}) {
    try {
      const tail = options.tail || this.logTailSize;
      const follow = options.follow || false;
      
      // In a real implementation, this would use Docker API or execute a command
      // For now, we'll simulate this with a mock response
      // In the actual extension, this would communicate with the background script
      // which would execute the Docker command via native messaging
      
      // Simulated log data
      const logData = `[${new Date().toISOString()}] N8N started successfully\n` +
                      `[${new Date().toISOString()}] Listening on port ${this.defaultPort}\n` +
                      `[${new Date().toISOString()}] Webhook URL: ${this.defaultProtocol}://${this.defaultHost}:${this.defaultPort}/\n`;
      
      // Notify log listeners if any
      if (this.logListeners.length > 0) {
        this.logListeners.forEach(listener => listener(logData));
      }
      
      return logData;
    } catch (error) {
      console.error('Error getting container logs:', error);
      return `Error retrieving logs: ${error.message}`;
    }
  }

  /**
   * Start monitoring container status
   * @param {number} interval - Monitoring interval in milliseconds (default: 5000)
   * @returns {void}
   */
  startMonitoring(interval = 5000) {
    // Clear any existing interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Initial status check
    this.getContainerStatus().then(status => {
      this.notifyStatusListeners(status);
    });
    
    // Set up interval for continuous monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        const status = await this.getContainerStatus();
        this.notifyStatusListeners(status);
      } catch (error) {
        console.error('Error in container monitoring:', error);
      }
    }, interval);
    
    return this.monitoringInterval;
  }

  /**
   * Stop monitoring container status
   * @returns {void}
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Add a listener for container logs
   * @param {Function} listener - Callback function that receives log data
   * @returns {Function} - Function to remove the listener
   */
  addLogListener(listener) {
    if (typeof listener === 'function') {
      this.logListeners.push(listener);
      
      // Return function to remove this listener
      return () => {
        this.logListeners = this.logListeners.filter(l => l !== listener);
      };
    }
  }

  /**
   * Add a listener for container status changes
   * @param {Function} listener - Callback function that receives status data
   * @returns {Function} - Function to remove the listener
   */
  addStatusListener(listener) {
    if (typeof listener === 'function') {
      this.statusListeners.push(listener);
      
      // Return function to remove this listener
      return () => {
        this.statusListeners = this.statusListeners.filter(l => l !== listener);
      };
    }
  }

  /**
   * Notify all status listeners of a status change
   * @param {Object} status - Container status data
   * @private
   */
  notifyStatusListeners(status) {
    if (this.statusListeners.length > 0) {
      this.statusListeners.forEach(listener => listener(status));
    }
  }

  /**
   * Stream container logs in real-time
   * @param {Function} callback - Callback function that receives each log line
   * @param {number} interval - Polling interval in milliseconds (default: 2000)
   * @returns {Object} - Control object with stop method
   */
  streamLogs(callback, interval = 2000) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    let lastLogTimestamp = new Date().getTime();
    let logInterval;
    
    // Function to fetch and process new logs
    const fetchLogs = async () => {
      try {
        const logs = await this.getContainerLogs();
        // In a real implementation, we would filter logs by timestamp
        // and only send new logs to the callback
        callback(logs);
        lastLogTimestamp = new Date().getTime();
      } catch (error) {
        console.error('Error streaming logs:', error);
      }
    };
    
    // Initial log fetch
    fetchLogs();
    
    // Set up interval for continuous log fetching
    logInterval = setInterval(fetchLogs, interval);
    
    // Return control object
    return {
      stop: () => {
        if (logInterval) {
          clearInterval(logInterval);
          logInterval = null;
        }
      }
    };
  }
}

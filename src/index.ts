#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CoolifyClient } from './services/coolify-client.js';
import { CoolifyTools } from './tools/coolify-tools.js';
import { prompts } from './prompts/index.js';

const server = new Server(
  {
    name: 'coolify-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// Check for required environment variables
const requiredEnvVars = ['COOLIFY_BASE_URL', 'COOLIFY_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these environment variables before running the server.');
  process.exit(1);
}

// Initialize Coolify client and tools
const coolifyClient = new CoolifyClient(
  process.env.COOLIFY_TOKEN!,
  process.env.COOLIFY_BASE_URL!
);
const coolifyTools = new CoolifyTools(coolifyClient);

// Register prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: prompts.map(prompt => ({
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments,
    })),
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const prompt = prompts.find(p => p.name === request.params.name);
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt.template,
        },
      },
    ],
  };
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Version & Health
      {
        name: 'coolify_version',
        description: 'Get the Coolify version information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'coolify_health',
        description: 'Check the health status of Coolify and its services',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Teams
      {
        name: 'list_teams',
        description: 'List all teams',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_team',
        description: 'Get details of a specific team',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: {
              type: 'number',
              description: 'The team ID',
            },
          },
          required: ['teamId'],
        },
      },
      {
        name: 'get_current_team',
        description: 'Get details of the current team',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_current_team_members',
        description: 'Get members of the current team',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Servers
      {
        name: 'list_servers',
        description: 'List all servers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_server',
        description: 'Create a new server',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Server name' },
            description: { type: 'string', description: 'Server description' },
            ip: { type: 'string', description: 'Server IP address' },
            port: { type: 'number', description: 'SSH port', default: 22 },
            user: { type: 'string', description: 'SSH user', default: 'root' },
            private_key_uuid: { type: 'string', description: 'UUID of the private key to use for SSH' },
            is_build_server: { type: 'boolean', description: 'Whether this is a build server' },
            instant_validate: { type: 'boolean', description: 'Validate server immediately after creation' },
          },
          required: ['name', 'ip', 'private_key_uuid'],
        },
      },
      {
        name: 'validate_server',
        description: 'Validate server connection and configuration',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The server UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'get_server_resources',
        description: 'Get all resources (applications, services, databases) on a server',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The server UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'get_server_domains',
        description: 'Get all domains configured on a server',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The server UUID' },
          },
          required: ['uuid'],
        },
      },
      // Projects
      {
        name: 'list_projects',
        description: 'List all projects',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_project',
        description: 'Get details of a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: 'The project ID' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'create_project',
        description: 'Create a new project',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description' },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_project',
        description: 'Update an existing project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: 'The project ID' },
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'delete_project',
        description: 'Delete a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: 'The project ID' },
          },
          required: ['projectId'],
        },
      },
      // Applications
      {
        name: 'list_applications',
        description: 'List all applications',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_application',
        description: 'Get details of a specific application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'create_application',
        description: 'Create a new application',
        inputSchema: {
          type: 'object',
          properties: {
            project_uuid: { type: 'string', description: 'Project UUID' },
            environment_name: { type: 'string', description: 'Environment name' },
            server_uuid: { type: 'string', description: 'Server UUID' },
            type: { type: 'string', enum: ['public', 'private'], description: 'Application type' },
            name: { type: 'string', description: 'Application name' },
            description: { type: 'string', description: 'Application description' },
            git_repository: { type: 'string', description: 'Git repository URL' },
            git_branch: { type: 'string', description: 'Git branch' },
            git_commit_sha: { type: 'string', description: 'Git commit SHA' },
            ports_exposes: { type: 'string', description: 'Exposed ports' },
            ports_mappings: { type: 'string', description: 'Port mappings' },
            build_pack: { type: 'string', description: 'Build pack to use' },
            install_command: { type: 'string', description: 'Install command' },
            build_command: { type: 'string', description: 'Build command' },
            start_command: { type: 'string', description: 'Start command' },
            base_directory: { type: 'string', description: 'Base directory' },
            publish_directory: { type: 'string', description: 'Publish directory' },
            health_check_enabled: { type: 'boolean', description: 'Enable health check' },
            health_check_path: { type: 'string', description: 'Health check path' },
            limits_memory: { type: 'string', description: 'Memory limit' },
            limits_cpus: { type: 'string', description: 'CPU limit' },
            instant_deploy: { type: 'boolean', description: 'Deploy immediately after creation' },
          },
          required: ['project_uuid', 'server_uuid', 'type', 'name'],
        },
      },
      {
        name: 'update_application',
        description: 'Update an existing application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
            name: { type: 'string', description: 'Application name' },
            description: { type: 'string', description: 'Application description' },
            git_repository: { type: 'string', description: 'Git repository URL' },
            git_branch: { type: 'string', description: 'Git branch' },
            git_commit_sha: { type: 'string', description: 'Git commit SHA' },
            ports_exposes: { type: 'string', description: 'Exposed ports' },
            ports_mappings: { type: 'string', description: 'Port mappings' },
            build_pack: { type: 'string', description: 'Build pack to use' },
            install_command: { type: 'string', description: 'Install command' },
            build_command: { type: 'string', description: 'Build command' },
            start_command: { type: 'string', description: 'Start command' },
            base_directory: { type: 'string', description: 'Base directory' },
            publish_directory: { type: 'string', description: 'Publish directory' },
            health_check_enabled: { type: 'boolean', description: 'Enable health check' },
            health_check_path: { type: 'string', description: 'Health check path' },
            limits_memory: { type: 'string', description: 'Memory limit' },
            limits_cpus: { type: 'string', description: 'CPU limit' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'delete_application',
        description: 'Delete an application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'start_application',
        description: 'Start an application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'stop_application',
        description: 'Stop an application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'restart_application',
        description: 'Restart an application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'execute_command',
        description: 'Execute a command in an application container',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
            command: { type: 'string', description: 'Command to execute' },
            workDir: { type: 'string', description: 'Working directory' },
          },
          required: ['uuid', 'command'],
        },
      },
      {
        name: 'get_application_logs',
        description: 'Get logs from an application',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The application UUID' },
            since: { type: 'number', description: 'Unix timestamp to get logs since' },
          },
          required: ['uuid'],
        },
      },
      // Databases
      {
        name: 'list_databases',
        description: 'List all databases',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_database',
        description: 'Get details of a specific database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'create_database',
        description: 'Create a new database',
        inputSchema: {
          type: 'object',
          properties: {
            project_uuid: { type: 'string', description: 'Project UUID' },
            environment_name: { type: 'string', description: 'Environment name' },
            server_uuid: { type: 'string', description: 'Server UUID' },
            type: { 
              type: 'string', 
              enum: ['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis'],
              description: 'Database type',
            },
            name: { type: 'string', description: 'Database name' },
            description: { type: 'string', description: 'Database description' },
            version: { type: 'string', description: 'Database version' },
            public_port: { type: 'number', description: 'Public port' },
            limits_memory: { type: 'string', description: 'Memory limit' },
            limits_cpus: { type: 'string', description: 'CPU limit' },
            postgres_user: { type: 'string', description: 'PostgreSQL user' },
            postgres_password: { type: 'string', description: 'PostgreSQL password' },
            postgres_db: { type: 'string', description: 'PostgreSQL database name' },
            mysql_user: { type: 'string', description: 'MySQL user' },
            mysql_password: { type: 'string', description: 'MySQL password' },
            mysql_database: { type: 'string', description: 'MySQL database name' },
            mysql_root_password: { type: 'string', description: 'MySQL root password' },
            mariadb_user: { type: 'string', description: 'MariaDB user' },
            mariadb_password: { type: 'string', description: 'MariaDB password' },
            mariadb_database: { type: 'string', description: 'MariaDB database name' },
            mariadb_root_password: { type: 'string', description: 'MariaDB root password' },
            mongo_initdb_root_username: { type: 'string', description: 'MongoDB root username' },
            mongo_initdb_root_password: { type: 'string', description: 'MongoDB root password' },
            mongo_initdb_database: { type: 'string', description: 'MongoDB database name' },
            redis_password: { type: 'string', description: 'Redis password' },
            instant_deploy: { type: 'boolean', description: 'Deploy immediately after creation' },
          },
          required: ['project_uuid', 'server_uuid', 'type', 'name'],
        },
      },
      {
        name: 'update_database',
        description: 'Update an existing database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
            name: { type: 'string', description: 'Database name' },
            description: { type: 'string', description: 'Database description' },
            version: { type: 'string', description: 'Database version' },
            public_port: { type: 'number', description: 'Public port' },
            limits_memory: { type: 'string', description: 'Memory limit' },
            limits_cpus: { type: 'string', description: 'CPU limit' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'delete_database',
        description: 'Delete a database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'start_database',
        description: 'Start a database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'stop_database',
        description: 'Stop a database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'restart_database',
        description: 'Restart a database',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The database UUID' },
          },
          required: ['uuid'],
        },
      },
      // Services
      {
        name: 'list_services',
        description: 'List all services',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_service',
        description: 'Get details of a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'create_service',
        description: 'Create a new service',
        inputSchema: {
          type: 'object',
          properties: {
            project_uuid: { type: 'string', description: 'Project UUID' },
            environment_name: { type: 'string', description: 'Environment name' },
            server_uuid: { type: 'string', description: 'Server UUID' },
            type: { type: 'string', description: 'Service type (e.g., plausible, umami, etc.)' },
            name: { type: 'string', description: 'Service name' },
            description: { type: 'string', description: 'Service description' },
            instant_deploy: { type: 'boolean', description: 'Deploy immediately after creation' },
          },
          required: ['project_uuid', 'server_uuid', 'type', 'name'],
        },
      },
      {
        name: 'update_service',
        description: 'Update an existing service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
            name: { type: 'string', description: 'Service name' },
            description: { type: 'string', description: 'Service description' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'delete_service',
        description: 'Delete a service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'start_service',
        description: 'Start a service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'stop_service',
        description: 'Stop a service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'restart_service',
        description: 'Restart a service',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The service UUID' },
          },
          required: ['uuid'],
        },
      },
      // Environment Variables
      {
        name: 'list_environment_variables',
        description: 'List environment variables for a resource',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: { 
              type: 'string',
              enum: ['application', 'service', 'database'],
              description: 'Resource type',
            },
            resourceUuid: { type: 'string', description: 'Resource UUID' },
          },
          required: ['resourceType', 'resourceUuid'],
        },
      },
      {
        name: 'create_environment_variable',
        description: 'Create a new environment variable',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: { 
              type: 'string',
              enum: ['application', 'service', 'database'],
              description: 'Resource type',
            },
            resourceUuid: { type: 'string', description: 'Resource UUID' },
            key: { type: 'string', description: 'Environment variable key' },
            value: { type: 'string', description: 'Environment variable value' },
            is_build_time: { type: 'boolean', description: 'Available at build time' },
            is_preview: { type: 'boolean', description: 'Available in preview deployments' },
            is_shared: { type: 'boolean', description: 'Shared across environments' },
          },
          required: ['resourceType', 'resourceUuid', 'key', 'value'],
        },
      },
      {
        name: 'update_environment_variable',
        description: 'Update an existing environment variable',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: { 
              type: 'string',
              enum: ['application', 'service', 'database'],
              description: 'Resource type',
            },
            resourceUuid: { type: 'string', description: 'Resource UUID' },
            envId: { type: 'number', description: 'Environment variable ID' },
            key: { type: 'string', description: 'Environment variable key' },
            value: { type: 'string', description: 'Environment variable value' },
            is_build_time: { type: 'boolean', description: 'Available at build time' },
            is_preview: { type: 'boolean', description: 'Available in preview deployments' },
            is_shared: { type: 'boolean', description: 'Shared across environments' },
          },
          required: ['resourceType', 'resourceUuid', 'envId'],
        },
      },
      {
        name: 'delete_environment_variable',
        description: 'Delete an environment variable',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: { 
              type: 'string',
              enum: ['application', 'service', 'database'],
              description: 'Resource type',
            },
            resourceUuid: { type: 'string', description: 'Resource UUID' },
            envId: { type: 'number', description: 'Environment variable ID' },
          },
          required: ['resourceType', 'resourceUuid', 'envId'],
        },
      },
      // Deployments
      {
        name: 'list_deployments',
        description: 'List all deployments',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_deployment',
        description: 'Get details of a specific deployment',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The deployment UUID' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'deploy_webhook',
        description: 'Trigger deployment via webhook',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'Application or service UUID' },
            tag: { type: 'string', description: 'Docker image tag' },
          },
          required: ['uuid'],
        },
      },
      // Private Keys
      {
        name: 'list_private_keys',
        description: 'List all private keys',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_private_key',
        description: 'Create a new private key',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Private key name' },
            description: { type: 'string', description: 'Private key description' },
            private_key: { type: 'string', description: 'Private key content' },
          },
          required: ['name', 'private_key'],
        },
      },
      {
        name: 'update_private_key',
        description: 'Update an existing private key',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The private key UUID' },
            name: { type: 'string', description: 'Private key name' },
            description: { type: 'string', description: 'Private key description' },
            private_key: { type: 'string', description: 'Private key content' },
          },
          required: ['uuid'],
        },
      },
      {
        name: 'delete_private_key',
        description: 'Delete a private key',
        inputSchema: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: 'The private key UUID' },
          },
          required: ['uuid'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Version & Health
      case 'coolify_version':
        return await coolifyTools.getVersion();
      case 'coolify_health':
        return await coolifyTools.checkHealth();

      // Teams
      case 'list_teams':
        return await coolifyTools.listTeams();
      case 'get_team':
        return await coolifyTools.getTeam(args);
      case 'get_current_team':
        return await coolifyTools.getCurrentTeam();
      case 'get_current_team_members':
        return await coolifyTools.getCurrentTeamMembers();

      // Servers
      case 'list_servers':
        return await coolifyTools.listServers();
      case 'create_server':
        return await coolifyTools.createServer(args);
      case 'validate_server':
        return await coolifyTools.validateServer(args);
      case 'get_server_resources':
        return await coolifyTools.getServerResources(args);
      case 'get_server_domains':
        return await coolifyTools.getServerDomains(args);

      // Projects
      case 'list_projects':
        return await coolifyTools.listProjects();
      case 'get_project':
        return await coolifyTools.getProject(args);
      case 'create_project':
        return await coolifyTools.createProject(args);
      case 'update_project':
        return await coolifyTools.updateProject(args);
      case 'delete_project':
        return await coolifyTools.deleteProject(args);

      // Applications
      case 'list_applications':
        return await coolifyTools.listApplications();
      case 'get_application':
        return await coolifyTools.getApplication(args);
      case 'create_application':
        return await coolifyTools.createApplication(args);
      case 'update_application':
        return await coolifyTools.updateApplication(args);
      case 'delete_application':
        return await coolifyTools.deleteApplication(args);
      case 'start_application':
        return await coolifyTools.startApplication(args);
      case 'stop_application':
        return await coolifyTools.stopApplication(args);
      case 'restart_application':
        return await coolifyTools.restartApplication(args);
      case 'execute_command':
        return await coolifyTools.executeCommand(args);
      case 'get_application_logs':
        return await coolifyTools.getApplicationLogs(args);

      // Databases
      case 'list_databases':
        return await coolifyTools.listDatabases();
      case 'get_database':
        return await coolifyTools.getDatabase(args);
      case 'create_database':
        return await coolifyTools.createDatabase(args);
      case 'update_database':
        return await coolifyTools.updateDatabase(args);
      case 'delete_database':
        return await coolifyTools.deleteDatabase(args);
      case 'start_database':
        return await coolifyTools.startDatabase(args);
      case 'stop_database':
        return await coolifyTools.stopDatabase(args);
      case 'restart_database':
        return await coolifyTools.restartDatabase(args);

      // Services
      case 'list_services':
        return await coolifyTools.listServices();
      case 'get_service':
        return await coolifyTools.getService(args);
      case 'create_service':
        return await coolifyTools.createService(args);
      case 'update_service':
        return await coolifyTools.updateService(args);
      case 'delete_service':
        return await coolifyTools.deleteService(args);
      case 'start_service':
        return await coolifyTools.startService(args);
      case 'stop_service':
        return await coolifyTools.stopService(args);
      case 'restart_service':
        return await coolifyTools.restartService(args);

      // Environment Variables
      case 'list_environment_variables':
        return await coolifyTools.listEnvironmentVariables(args);
      case 'create_environment_variable':
        return await coolifyTools.createEnvironmentVariable(args);
      case 'update_environment_variable':
        return await coolifyTools.updateEnvironmentVariable(args);
      case 'delete_environment_variable':
        return await coolifyTools.deleteEnvironmentVariable(args);

      // Deployments
      case 'list_deployments':
        return await coolifyTools.listDeployments();
      case 'get_deployment':
        return await coolifyTools.getDeployment(args);
      case 'deploy_webhook':
        return await coolifyTools.deployByWebhook(args);

      // Private Keys
      case 'list_private_keys':
        return await coolifyTools.listPrivateKeys();
      case 'create_private_key':
        return await coolifyTools.createPrivateKey(args);
      case 'update_private_key':
        return await coolifyTools.updatePrivateKey(args);
      case 'delete_private_key':
        return await coolifyTools.deletePrivateKey(args);

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return {
      isError: true,
      content: [{ 
        type: 'text', 
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      }],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Coolify MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


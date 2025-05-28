import { z } from 'zod';
import { CoolifyClient } from '../services/coolify-client.js';
import type { CoolifyApiError } from '../types/coolify.js';

// Input validation schemas
const TeamIdSchema = z.object({
  teamId: z.number().describe('The team ID'),
});

const ServerUuidSchema = z.object({
  uuid: z.string().describe('The server UUID'),
});

const ProjectIdSchema = z.object({
  projectId: z.number().describe('The project ID'),
});

const ApplicationUuidSchema = z.object({
  uuid: z.string().describe('The application UUID'),
});

const DatabaseUuidSchema = z.object({
  uuid: z.string().describe('The database UUID'),
});

const ServiceUuidSchema = z.object({
  uuid: z.string().describe('The service UUID'),
});

const DeploymentUuidSchema = z.object({
  uuid: z.string().describe('The deployment UUID'),
});

const PrivateKeyUuidSchema = z.object({
  uuid: z.string().describe('The private key UUID'),
});

const CreateServerSchema = z.object({
  name: z.string().describe('Server name'),
  description: z.string().optional().describe('Server description'),
  ip: z.string().describe('Server IP address'),
  port: z.number().default(22).describe('SSH port'),
  user: z.string().default('root').describe('SSH user'),
  private_key_uuid: z.string().describe('UUID of the private key to use for SSH'),
  is_build_server: z.boolean().optional().describe('Whether this is a build server'),
  instant_validate: z.boolean().optional().describe('Validate server immediately after creation'),
});

const CreateApplicationSchema = z.object({
  project_uuid: z.string().describe('Project UUID'),
  environment_name: z.string().optional().describe('Environment name'),
  server_uuid: z.string().describe('Server UUID'),
  type: z.enum(['public', 'private']).describe('Application type'),
  name: z.string().describe('Application name'),
  description: z.string().optional().describe('Application description'),
  git_repository: z.string().optional().describe('Git repository URL'),
  git_branch: z.string().optional().describe('Git branch'),
  git_commit_sha: z.string().optional().describe('Git commit SHA'),
  ports_exposes: z.string().optional().describe('Exposed ports'),
  ports_mappings: z.string().optional().describe('Port mappings'),
  build_pack: z.string().optional().describe('Build pack to use'),
  install_command: z.string().optional().describe('Install command'),
  build_command: z.string().optional().describe('Build command'),
  start_command: z.string().optional().describe('Start command'),
  base_directory: z.string().optional().describe('Base directory'),
  publish_directory: z.string().optional().describe('Publish directory'),
  health_check_enabled: z.boolean().optional().describe('Enable health check'),
  health_check_path: z.string().optional().describe('Health check path'),
  limits_memory: z.string().optional().describe('Memory limit'),
  limits_cpus: z.string().optional().describe('CPU limit'),
  instant_deploy: z.boolean().optional().describe('Deploy immediately after creation'),
});

const CreateDatabaseSchema = z.object({
  project_uuid: z.string().describe('Project UUID'),
  environment_name: z.string().optional().describe('Environment name'),
  server_uuid: z.string().describe('Server UUID'),
  type: z.enum(['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis']).describe('Database type'),
  name: z.string().describe('Database name'),
  description: z.string().optional().describe('Database description'),
  version: z.string().optional().describe('Database version'),
  public_port: z.number().optional().describe('Public port'),
  limits_memory: z.string().optional().describe('Memory limit'),
  limits_cpus: z.string().optional().describe('CPU limit'),
  postgres_user: z.string().optional().describe('PostgreSQL user'),
  postgres_password: z.string().optional().describe('PostgreSQL password'),
  postgres_db: z.string().optional().describe('PostgreSQL database name'),
  mysql_user: z.string().optional().describe('MySQL user'),
  mysql_password: z.string().optional().describe('MySQL password'),
  mysql_database: z.string().optional().describe('MySQL database name'),
  mysql_root_password: z.string().optional().describe('MySQL root password'),
  mariadb_user: z.string().optional().describe('MariaDB user'),
  mariadb_password: z.string().optional().describe('MariaDB password'),
  mariadb_database: z.string().optional().describe('MariaDB database name'),
  mariadb_root_password: z.string().optional().describe('MariaDB root password'),
  mongo_initdb_root_username: z.string().optional().describe('MongoDB root username'),
  mongo_initdb_root_password: z.string().optional().describe('MongoDB root password'),
  mongo_initdb_database: z.string().optional().describe('MongoDB database name'),
  redis_password: z.string().optional().describe('Redis password'),
  instant_deploy: z.boolean().optional().describe('Deploy immediately after creation'),
});

const CreateServiceSchema = z.object({
  project_uuid: z.string().describe('Project UUID'),
  environment_name: z.string().optional().describe('Environment name'),
  server_uuid: z.string().describe('Server UUID'),
  type: z.string().describe('Service type (e.g., plausible, umami, etc.)'),
  name: z.string().describe('Service name'),
  description: z.string().optional().describe('Service description'),
  instant_deploy: z.boolean().optional().describe('Deploy immediately after creation'),
});

const CreateProjectSchema = z.object({
  name: z.string().describe('Project name'),
  description: z.string().optional().describe('Project description'),
});

const EnvironmentVariableSchema = z.object({
  resourceType: z.enum(['application', 'service', 'database']).describe('Resource type'),
  resourceUuid: z.string().describe('Resource UUID'),
  key: z.string().describe('Environment variable key'),
  value: z.string().describe('Environment variable value'),
  is_build_time: z.boolean().optional().describe('Available at build time'),
  is_preview: z.boolean().optional().describe('Available in preview deployments'),
  is_shared: z.boolean().optional().describe('Shared across environments'),
});

const ExecuteCommandSchema = z.object({
  uuid: z.string().describe('Application UUID'),
  command: z.string().describe('Command to execute'),
  workDir: z.string().optional().describe('Working directory'),
});

const DeployWebhookSchema = z.object({
  uuid: z.string().describe('Application or service UUID'),
  tag: z.string().optional().describe('Docker image tag'),
});

const CreatePrivateKeySchema = z.object({
  name: z.string().describe('Private key name'),
  description: z.string().optional().describe('Private key description'),
  private_key: z.string().describe('Private key content'),
});

export class CoolifyTools {
  constructor(private client: CoolifyClient) {}

  private formatError(error: unknown): { isError: true; content: Array<{ type: 'text'; text: string }> } {
    let message = 'An unexpected error occurred';
    
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as CoolifyApiError;
      message = apiError.message;
      
      if (apiError.errors) {
        const errorDetails = Object.entries(apiError.errors)
          .map(([field, messages]) => {
            const messageList = Array.isArray(messages) ? messages : [String(messages)];
            return `${field}: ${messageList.join(', ')}`;
          })
          .join('\n');
        message = `${message}\n${errorDetails}`;
      }
      
      if (apiError.status) {
        message = `[${apiError.status}] ${message}`;
      }
    }

    return {
      isError: true,
      content: [{ type: 'text', text: message }],
    };
  }

  // Version & Health Tools
  async getVersion() {
    try {
      const version = await this.client.getVersion();
      return {
        content: [{
          type: 'text',
          text: `Coolify Version: ${version.version}${version.build_date ? `\nBuild Date: ${version.build_date}` : ''}${version.commit_hash ? `\nCommit: ${version.commit_hash}` : ''}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async checkHealth() {
    try {
      const health = await this.client.checkHealth();
      let text = `Status: ${health.status}\nTimestamp: ${health.timestamp}`;
      
      if (health.services) {
        text += '\n\nServices:';
        text += `\n- Database: ${health.services.database ? '✅' : '❌'}`;
        text += `\n- Redis: ${health.services.redis ? '✅' : '❌'}`;
        text += `\n- Docker: ${health.services.docker ? '✅' : '❌'}`;
      }
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Team Tools
  async listTeams() {
    try {
      const teams = await this.client.listTeams();
      const text = teams.map(team =>
        `ID: ${team.id}\n` +
        `Name: ${team.name}\n` +
        `Personal: ${team.personal_team ? 'Yes' : 'No'}` +
        (team.description ? `\nDescription: ${team.description}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No teams found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getTeam(input: unknown) {
    try {
      const { teamId } = TeamIdSchema.parse(input);
      const team = await this.client.getTeam(teamId);
      
      return {
        content: [{
          type: 'text',
          text: `ID: ${team.id}\nName: ${team.name}\nPersonal: ${team.personal_team ? 'Yes' : 'No'}${team.description ? `\nDescription: ${team.description}` : ''}\nCreated: ${team.created_at}\nUpdated: ${team.updated_at}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getCurrentTeam() {
    try {
      const team = await this.client.getCurrentTeam();
      
      return {
        content: [{
          type: 'text',
          text: `Current Team:\nID: ${team.id}\nName: ${team.name}\nPersonal: ${team.personal_team ? 'Yes' : 'No'}${team.description ? `\nDescription: ${team.description}` : ''}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getCurrentTeamMembers() {
    try {
      const members = await this.client.getCurrentTeamMembers();
      const text = members.map(member =>
        `ID: ${member.id}\n` +
        `Name: ${member.name}\n` +
        `Email: ${member.email}\n` +
        `Role: ${member.role}\n` +
        `Joined: ${member.joined_at}`
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No team members found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Server Tools
  async listServers() {
    try {
      const servers = await this.client.listServers();
      const text = servers.map(server =>
        `UUID: ${server.uuid}\n` +
        `Name: ${server.name}\n` +
        `IP: ${server.ip}:${server.port}\n` +
        `User: ${server.user}` +
        (server.proxy ? `\nProxy: ${server.proxy.type} (${server.proxy.status})` : '') +
        (server.description ? `\nDescription: ${server.description}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No servers found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createServer(input: unknown) {
    try {
      const data = CreateServerSchema.parse(input);
      const server = await this.client.createServer(data);
      
      return {
        content: [{
          type: 'text',
          text: `Server created successfully!\nUUID: ${server.uuid}\nName: ${server.name}\nIP: ${server.ip}:${server.port}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async validateServer(input: unknown) {
    try {
      const { uuid } = ServerUuidSchema.parse(input);
      const validation = await this.client.validateServer(uuid);
      
      let text = `Server: ${validation.server}\nStatus: ${validation.status}`;
      if (validation.message) {
        text += `\nMessage: ${validation.message}`;
      }
      if (validation.errors && validation.errors.length > 0) {
        text += `\nErrors:\n${validation.errors.map(e => `- ${e}`).join('\n')}`;
      }
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getServerResources(input: unknown) {
    try {
      const { uuid } = ServerUuidSchema.parse(input);
      const resources = await this.client.getServerResources(uuid);
      
      const text = resources.map(resource =>
        `UUID: ${resource.uuid}\n` +
        `Name: ${resource.name}\n` +
        `Type: ${resource.type}\n` +
        `Status: ${resource.status}` +
        (resource.fqdn ? `\nURL: ${resource.fqdn}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No resources found on this server',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getServerDomains(input: unknown) {
    try {
      const { uuid } = ServerUuidSchema.parse(input);
      const domains = await this.client.getServerDomains(uuid);
      
      const text = domains.map(domain =>
        `Domain: ${domain.domain}\n` +
        `Resource Type: ${domain.resource_type}\n` +
        `Resource ID: ${domain.resource_id}`
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No domains found on this server',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Project Tools
  async listProjects() {
    try {
      const projects = await this.client.listProjects();
      const text = projects.map(project =>
        `UUID: ${project.uuid}\n` +
        `Name: ${project.name}` +
        (project.description ? `\nDescription: ${project.description}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No projects found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getProject(input: unknown) {
    try {
      const { projectId } = ProjectIdSchema.parse(input);
      const project = await this.client.getProject(projectId);
      
      return {
        content: [{
          type: 'text',
          text: `UUID: ${project.uuid}\nName: ${project.name}${project.description ? `\nDescription: ${project.description}` : ''}\nTeam ID: ${project.team_id}\nCreated: ${project.created_at}\nUpdated: ${project.updated_at}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createProject(input: unknown) {
    try {
      const data = CreateProjectSchema.parse(input);
      const project = await this.client.createProject(data);
      
      return {
        content: [{
          type: 'text',
          text: `Project created successfully!\nUUID: ${project.uuid}\nName: ${project.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updateProject(input: unknown) {
    try {
      const parsed = ProjectIdSchema.merge(CreateProjectSchema.partial()).parse(input);
      const { projectId, ...data } = parsed;
      const project = await this.client.updateProject(projectId, data);
      
      return {
        content: [{
          type: 'text',
          text: `Project updated successfully!\nUUID: ${project.uuid}\nName: ${project.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deleteProject(input: unknown) {
    try {
      const { projectId } = ProjectIdSchema.parse(input);
      await this.client.deleteProject(projectId);
      
      return {
        content: [{
          type: 'text',
          text: 'Project deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Application Tools
  async listApplications() {
    try {
      const applications = await this.client.listApplications();
      const text = applications.map(app =>
        `UUID: ${app.uuid}\n` +
        `Name: ${app.name}\n` +
        `Status: ${app.status}\n` +
        `Build Pack: ${app.build_pack}` +
        (app.fqdn ? `\nURL: ${app.fqdn}` : '') +
        (app.git_repository ? `\nRepository: ${app.git_repository}` : '') +
        (app.git_branch ? `\nBranch: ${app.git_branch}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No applications found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getApplication(input: unknown) {
    try {
      const { uuid } = ApplicationUuidSchema.parse(input);
      const app = await this.client.getApplication(uuid);
      
      let text = `UUID: ${app.uuid}\nName: ${app.name}\nStatus: ${app.status}\nBuild Pack: ${app.build_pack}`;
      if (app.description) text += `\nDescription: ${app.description}`;
      if (app.fqdn) text += `\nURL: ${app.fqdn}`;
      if (app.git_repository) text += `\nRepository: ${app.git_repository}`;
      if (app.git_branch) text += `\nBranch: ${app.git_branch}`;
      if (app.git_commit_sha) text += `\nCommit: ${app.git_commit_sha}`;
      if (app.port_mappings) text += `\nPort Mappings: ${app.port_mappings}`;
      if (app.port_exposes) text += `\nExposed Ports: ${app.port_exposes}`;
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createApplication(input: unknown) {
    try {
      const data = CreateApplicationSchema.parse(input);
      const app = await this.client.createApplication(data);
      
      return {
        content: [{
          type: 'text',
          text: `Application created successfully!\nUUID: ${app.uuid}\nName: ${app.name}\nStatus: ${app.status}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updateApplication(input: unknown) {
    try {
      const parsed = ApplicationUuidSchema.merge(CreateApplicationSchema.partial()).parse(input);
      const { uuid, ...data } = parsed;
      const app = await this.client.updateApplication(uuid, data);
      
      return {
        content: [{
          type: 'text',
          text: `Application updated successfully!\nUUID: ${app.uuid}\nName: ${app.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deleteApplication(input: unknown) {
    try {
      const { uuid } = ApplicationUuidSchema.parse(input);
      await this.client.deleteApplication(uuid);
      
      return {
        content: [{
          type: 'text',
          text: 'Application deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async startApplication(input: unknown) {
    try {
      const { uuid } = ApplicationUuidSchema.parse(input);
      const result = await this.client.startApplication(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async stopApplication(input: unknown) {
    try {
      const { uuid } = ApplicationUuidSchema.parse(input);
      const result = await this.client.stopApplication(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async restartApplication(input: unknown) {
    try {
      const { uuid } = ApplicationUuidSchema.parse(input);
      const result = await this.client.restartApplication(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async executeCommand(input: unknown) {
    try {
      const { uuid, command, workDir } = ExecuteCommandSchema.parse(input);
      const result = await this.client.executeCommand(uuid, { command, workDir });
      
      let text = `Exit Code: ${result.exitCode}`;
      if (result.stdout) text += `\n\nStdout:\n${result.stdout}`;
      if (result.stderr) text += `\n\nStderr:\n${result.stderr}`;
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getApplicationLogs(input: unknown) {
    try {
      const parsed = ApplicationUuidSchema.merge(z.object({
        since: z.number().optional().describe('Unix timestamp to get logs since'),
      })).parse(input);
      
      const logs = await this.client.getApplicationLogs(parsed.uuid, parsed.since);
      
      return {
        content: [{
          type: 'text',
          text: logs || 'No logs available',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Database Tools
  async listDatabases() {
    try {
      const databases = await this.client.listDatabases();
      const text = databases.map(db =>
        `UUID: ${db.uuid}\n` +
        `Name: ${db.name}\n` +
        `Type: ${db.type} v${db.version}\n` +
        `Status: ${db.status}` +
        (db.public_port ? `\nPublic Port: ${db.public_port}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No databases found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getDatabase(input: unknown) {
    try {
      const { uuid } = DatabaseUuidSchema.parse(input);
      const db = await this.client.getDatabase(uuid);
      
      let text = `UUID: ${db.uuid}\nName: ${db.name}\nType: ${db.type} v${db.version}\nStatus: ${db.status}`;
      if (db.description) text += `\nDescription: ${db.description}`;
      if (db.public_port) text += `\nPublic Port: ${db.public_port}`;
      text += `\nEnvironment ID: ${db.environment_id}`;
      text += `\nDestination ID: ${db.destination_id}`;
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createDatabase(input: unknown) {
    try {
      const data = CreateDatabaseSchema.parse(input);
      const db = await this.client.createDatabase(data);
      
      return {
        content: [{
          type: 'text',
          text: `Database created successfully!\nUUID: ${db.uuid}\nName: ${db.name}\nType: ${db.type} v${db.version}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updateDatabase(input: unknown) {
    try {
      const parsed = DatabaseUuidSchema.merge(CreateDatabaseSchema.partial()).parse(input);
      const { uuid, ...data } = parsed;
      const db = await this.client.updateDatabase(uuid, data);
      
      return {
        content: [{
          type: 'text',
          text: `Database updated successfully!\nUUID: ${db.uuid}\nName: ${db.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deleteDatabase(input: unknown) {
    try {
      const { uuid } = DatabaseUuidSchema.parse(input);
      await this.client.deleteDatabase(uuid);
      
      return {
        content: [{
          type: 'text',
          text: 'Database deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async startDatabase(input: unknown) {
    try {
      const { uuid } = DatabaseUuidSchema.parse(input);
      const result = await this.client.startDatabase(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async stopDatabase(input: unknown) {
    try {
      const { uuid } = DatabaseUuidSchema.parse(input);
      const result = await this.client.stopDatabase(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async restartDatabase(input: unknown) {
    try {
      const { uuid } = DatabaseUuidSchema.parse(input);
      const result = await this.client.restartDatabase(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Service Tools
  async listServices() {
    try {
      const services = await this.client.listServices();
      const text = services.map(service =>
        `UUID: ${service.uuid}\n` +
        `Name: ${service.name}\n` +
        `Type: ${service.type}${service.version ? ` v${service.version}` : ''}\n` +
        `Status: ${service.status}` +
        (service.fqdn ? `\nURL: ${service.fqdn}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No services found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getService(input: unknown) {
    try {
      const { uuid } = ServiceUuidSchema.parse(input);
      const service = await this.client.getService(uuid);
      
      let text = `UUID: ${service.uuid}\nName: ${service.name}\nType: ${service.type}${service.version ? ` v${service.version}` : ''}\nStatus: ${service.status}`;
      if (service.description) text += `\nDescription: ${service.description}`;
      if (service.fqdn) text += `\nURL: ${service.fqdn}`;
      text += `\nEnvironment ID: ${service.environment_id}`;
      text += `\nServer ID: ${service.server_id}`;
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createService(input: unknown) {
    try {
      const data = CreateServiceSchema.parse(input);
      const service = await this.client.createService(data);
      
      return {
        content: [{
          type: 'text',
          text: `Service created successfully!\nUUID: ${service.uuid}\nName: ${service.name}\nType: ${service.type}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updateService(input: unknown) {
    try {
      const parsed = ServiceUuidSchema.merge(CreateServiceSchema.partial()).parse(input);
      const { uuid, ...data } = parsed;
      const service = await this.client.updateService(uuid, data);
      
      return {
        content: [{
          type: 'text',
          text: `Service updated successfully!\nUUID: ${service.uuid}\nName: ${service.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deleteService(input: unknown) {
    try {
      const { uuid } = ServiceUuidSchema.parse(input);
      await this.client.deleteService(uuid);
      
      return {
        content: [{
          type: 'text',
          text: 'Service deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async startService(input: unknown) {
    try {
      const { uuid } = ServiceUuidSchema.parse(input);
      const result = await this.client.startService(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async stopService(input: unknown) {
    try {
      const { uuid } = ServiceUuidSchema.parse(input);
      const result = await this.client.stopService(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async restartService(input: unknown) {
    try {
      const { uuid } = ServiceUuidSchema.parse(input);
      const result = await this.client.restartService(uuid);
      
      return {
        content: [{
          type: 'text',
          text: result.message,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Environment Variable Tools
  async listEnvironmentVariables(input: unknown) {
    try {
      const parsed = z.object({
        resourceType: z.enum(['application', 'service', 'database']).describe('Resource type'),
        resourceUuid: z.string().describe('Resource UUID'),
      }).parse(input);
      
      const envVars = await this.client.listEnvironmentVariables(parsed.resourceType, parsed.resourceUuid);
      
      const text = envVars.map(env =>
        `${env.key}=${env.value}` +
        (env.is_build_time ? ' (build-time)' : '') +
        (env.is_preview ? ' (preview)' : '')
      ).join('\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No environment variables found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createEnvironmentVariable(input: unknown) {
    try {
      const { resourceType, resourceUuid, ...data } = EnvironmentVariableSchema.parse(input);
      const envVar = await this.client.createEnvironmentVariable(resourceType, resourceUuid, data);
      
      return {
        content: [{
          type: 'text',
          text: `Environment variable created: ${envVar.key}=${envVar.value}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updateEnvironmentVariable(input: unknown) {
    try {
      const parsed = EnvironmentVariableSchema.partial().merge(z.object({
        envId: z.number().describe('Environment variable ID'),
      })).parse(input);
      
      const { resourceType, resourceUuid, envId, ...data } = parsed;
      if (!resourceType || !resourceUuid) {
        throw new Error('resourceType and resourceUuid are required');
      }
      const envVar = await this.client.updateEnvironmentVariable(resourceType, resourceUuid, envId, data);
      
      return {
        content: [{
          type: 'text',
          text: `Environment variable updated: ${envVar.key}=${envVar.value}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deleteEnvironmentVariable(input: unknown) {
    try {
      const parsed = z.object({
        resourceType: z.enum(['application', 'service', 'database']).describe('Resource type'),
        resourceUuid: z.string().describe('Resource UUID'),
        envId: z.number().describe('Environment variable ID'),
      }).parse(input);
      
      await this.client.deleteEnvironmentVariable(parsed.resourceType, parsed.resourceUuid, parsed.envId);
      
      return {
        content: [{
          type: 'text',
          text: 'Environment variable deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Deployment Tools
  async listDeployments() {
    try {
      const deployments = await this.client.listDeployments();
      const text = deployments.map(deployment =>
        `UUID: ${deployment.uuid}\n` +
        `Status: ${deployment.status}\n` +
        `Application ID: ${deployment.application_id}` +
        (deployment.commit ? `\nCommit: ${deployment.commit}` : '') +
        (deployment.pull_request_id ? `\nPR #${deployment.pull_request_id}` : '') +
        `\nCreated: ${deployment.created_at}`
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No deployments found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async getDeployment(input: unknown) {
    try {
      const { uuid } = DeploymentUuidSchema.parse(input);
      const deployment = await this.client.getDeployment(uuid);
      
      let text = `UUID: ${deployment.uuid}\nStatus: ${deployment.status}\nApplication ID: ${deployment.application_id}`;
      if (deployment.commit) text += `\nCommit: ${deployment.commit}`;
      if (deployment.pull_request_id) text += `\nPR #${deployment.pull_request_id}`;
      text += `\nWebhook: ${deployment.is_webhook ? 'Yes' : 'No'}`;
      text += `\nForce Rebuild: ${deployment.force_rebuild ? 'Yes' : 'No'}`;
      text += `\nCreated: ${deployment.created_at}`;
      if (deployment.logs) text += `\n\nLogs:\n${deployment.logs}`;
      
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deployByWebhook(input: unknown) {
    try {
      const { uuid, tag } = DeployWebhookSchema.parse(input);
      const result = await this.client.deployByWebhook(uuid, tag);
      
      return {
        content: [{
          type: 'text',
          text: `${result.message}\nDeployment UUID: ${result.deployment_uuid}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Private Key Tools
  async listPrivateKeys() {
    try {
      const keys = await this.client.listPrivateKeys();
      const text = keys.map(key =>
        `UUID: ${key.uuid}\n` +
        `Name: ${key.name}` +
        (key.description ? `\nDescription: ${key.description}` : '')
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: text || 'No private keys found',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createPrivateKey(input: unknown) {
    try {
      const data = CreatePrivateKeySchema.parse(input);
      const key = await this.client.createPrivateKey(data);
      
      return {
        content: [{
          type: 'text',
          text: `Private key created successfully!\nUUID: ${key.uuid}\nName: ${key.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async updatePrivateKey(input: unknown) {
    try {
      const parsed = PrivateKeyUuidSchema.merge(CreatePrivateKeySchema.partial()).parse(input);
      const { uuid, ...data } = parsed;
      const key = await this.client.updatePrivateKey(uuid, data);
      
      return {
        content: [{
          type: 'text',
          text: `Private key updated successfully!\nUUID: ${key.uuid}\nName: ${key.name}`,
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async deletePrivateKey(input: unknown) {
    try {
      const { uuid } = PrivateKeyUuidSchema.parse(input);
      await this.client.deletePrivateKey(uuid);
      
      return {
        content: [{
          type: 'text',
          text: 'Private key deleted successfully',
        }],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }
}
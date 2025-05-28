export const prompts = [
  {
    name: 'deploy-git-app',
    description: 'Deploy a new application from a Git repository',
    arguments: [
      {
        name: 'repository',
        description: 'Git repository URL',
        required: true,
      },
      {
        name: 'appName',
        description: 'Application name',
        required: true,
      },
      {
        name: 'branch',
        description: 'Git branch (default: main)',
        required: false,
      },
    ],
    template: `Deploy a new application with these settings:
- Repository: {{repository}}
- Application name: {{appName}}
- Branch: {{branch}}

Steps:
1. List available projects and servers
2. Create the application in an appropriate project/server
3. Configure it with the Git repository
4. Start the deployment`,
  },
  {
    name: 'setup-database',
    description: 'Set up a new database with proper configuration',
    arguments: [
      {
        name: 'type',
        description: 'Database type (postgresql, mysql, mariadb, mongodb, redis)',
        required: true,
      },
      {
        name: 'name',
        description: 'Database name',
        required: true,
      },
      {
        name: 'projectName',
        description: 'Project name to deploy to',
        required: false,
      },
    ],
    template: `Set up a new {{type}} database:
- Database name: {{name}}
- Project: {{projectName}}

Steps:
1. Find or create the project
2. List available servers
3. Create the database with appropriate settings
4. Configure necessary environment variables
5. Start the database
6. Provide connection details`,
  },
  {
    name: 'deploy-service',
    description: 'Deploy a pre-configured service (like Plausible, Umami, etc.)',
    arguments: [
      {
        name: 'serviceType',
        description: 'Service type (e.g., plausible, umami, n8n)',
        required: true,
      },
      {
        name: 'name',
        description: 'Service instance name',
        required: true,
      },
    ],
    template: `Deploy a {{serviceType}} service:
- Service name: {{name}}

Steps:
1. List available projects and servers
2. Create the service in an appropriate location
3. Configure any required environment variables
4. Start the service
5. Provide the access URL`,
  },
  {
    name: 'environment-setup',
    description: 'Set up environment variables for an application',
    arguments: [
      {
        name: 'appName',
        description: 'Application name or UUID',
        required: true,
      },
      {
        name: 'envFile',
        description: 'Environment variables (KEY=value format)',
        required: true,
      },
    ],
    template: `Configure environment variables for {{appName}}:

Environment variables to set:
{{envFile}}

Steps:
1. Find the application by name or UUID
2. Parse and validate the environment variables
3. Create each environment variable
4. Restart the application if needed`,
  },
  {
    name: 'server-health-check',
    description: 'Check the health and resources of all servers',
    arguments: [],
    template: `Perform a comprehensive health check:

Steps:
1. Check Coolify system health
2. List all servers
3. Validate each server connection
4. List resources on each server
5. Check the status of all applications, databases, and services
6. Provide a summary report`,
  },
  {
    name: 'backup-database',
    description: 'Create a backup of a database',
    arguments: [
      {
        name: 'databaseName',
        description: 'Database name or UUID',
        required: true,
      },
    ],
    template: `Create a backup for database {{databaseName}}:

Steps:
1. Find the database by name or UUID
2. Check database type and status
3. Execute appropriate backup command
4. Store backup safely
5. Provide backup location and instructions for restoration`,
  },
  {
    name: 'scale-application',
    description: 'Scale an application by adjusting resources',
    arguments: [
      {
        name: 'appName',
        description: 'Application name or UUID',
        required: true,
      },
      {
        name: 'memory',
        description: 'Memory limit (e.g., 512M, 2G)',
        required: false,
      },
      {
        name: 'cpu',
        description: 'CPU limit (e.g., 0.5, 2)',
        required: false,
      },
    ],
    template: `Scale application {{appName}}:
- Memory: {{memory}}
- CPU: {{cpu}}

Steps:
1. Find the application
2. Update resource limits
3. Restart the application with new limits
4. Monitor the application status`,
  },
  {
    name: 'setup-ssl',
    description: 'Configure SSL/TLS for an application',
    arguments: [
      {
        name: 'appName',
        description: 'Application name or UUID',
        required: true,
      },
      {
        name: 'domain',
        description: 'Domain name for SSL',
        required: true,
      },
    ],
    template: `Configure SSL for {{appName}} on domain {{domain}}:

Steps:
1. Find the application
2. Update application settings with the domain
3. Ensure SSL is enabled
4. Trigger SSL certificate generation
5. Verify SSL configuration`,
  },
  {
    name: 'migrate-application',
    description: 'Migrate an application between servers',
    arguments: [
      {
        name: 'appName',
        description: 'Application to migrate',
        required: true,
      },
      {
        name: 'targetServer',
        description: 'Target server name or UUID',
        required: true,
      },
    ],
    template: `Migrate {{appName}} to {{targetServer}}:

Steps:
1. Find the application and current server
2. Validate target server
3. Back up application data and configuration
4. Create application on target server
5. Restore configuration and data
6. Update DNS/proxy settings
7. Verify application on new server
8. Clean up old instance`,
  },
  {
    name: 'troubleshoot-deployment',
    description: 'Troubleshoot a failed deployment',
    arguments: [
      {
        name: 'appName',
        description: 'Application name or UUID',
        required: true,
      },
    ],
    template: `Troubleshoot deployment issues for {{appName}}:

Steps:
1. Check application status
2. Review recent deployments
3. Examine deployment logs
4. Check server resources
5. Verify environment variables
6. Check build configuration
7. Provide diagnosis and recommendations`,
  },
];
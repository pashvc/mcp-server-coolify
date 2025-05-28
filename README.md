# Coolify MCP Server

<img src="graphics/CoolifyMCP.png" width="256" alt="Coolify MCP Logo" />

A comprehensive Model Context Protocol (MCP) server for the Coolify API. This server enables AI assistants to manage infrastructure, applications, databases, services, and more through your self-hosted Coolify PaaS platform.

> **Compatibility:** Tested with Coolify version 4.0.0-beta.418

## Prerequisites

- Node.js 18 or higher
- Coolify Base URL
- Coolify API token

## Features

### Core Management
- **Teams**: List teams, get team details, view team members
- **Projects**: Create, list, update, and delete projects
- **Servers**: Create servers, validate connections, view resources and domains
- **Private Keys**: Manage SSH keys for server access

### Applications
- Full CRUD operations (create, read, update, delete)
- Lifecycle management (start, stop, restart)
- Execute commands in containers
- View application logs
- Git integration (repository, branch, commit management)
- Resource limits configuration (memory, CPU)
- Health check configuration

### Databases
- Support for PostgreSQL, MySQL, MariaDB, MongoDB, and Redis
- Create and manage database instances
- Configure database-specific settings
- Lifecycle management (start, stop, restart)
- Resource limits and public port configuration

### Services
- Deploy pre-configured services (Plausible, Umami, n8n, etc.)
- Service lifecycle management
- Configuration updates

### Environment Variables
- Manage environment variables for applications, services, and databases
- Support for build-time and runtime variables
- Preview deployment variables
- Shared variables across environments

### Deployments
- List all deployments
- Get deployment details and logs
- Trigger deployments via webhook
- Support for Docker image tags

### Developer Experience
- Pre-configured prompts for common workflows
- Comprehensive error handling with detailed messages
- TypeScript support with full type safety
- Integration with MCP Inspector for debugging
- Robust API response handling for different Coolify versions
- Extensive test coverage with both unit and integration tests

## Installation

```bash
# Install globally
npm install -g @pashvc/mcp-server-coolify

# Or use with npx
npx @pashvc/mcp-server-coolify
```

## Configuration

The server requires two environment variables:

- `COOLIFY_BASE_URL`: The base URL of your Coolify instance
- `COOLIFY_TOKEN`: Your Coolify API token

### Getting an API Token

1. Go to your Coolify instance
2. Navigate to `Keys & Tokens` / `API tokens`
3. Create a new token with the following required permissions:
   - read (for fetching information)
   - write (for managing resources)
   - deploy (for deployment operations)

## Usage

### In MCP Settings

Add the following to your MCP settings configuration:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@pashvc/mcp-server-coolify"],
      "env": {
        "COOLIFY_BASE_URL": "your-coolify-url",
        "COOLIFY_TOKEN": "your-api-token"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Windows Cline users may need the following:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@pashvc/mcp-server-coolify"
      ],
      "env": {
        "COOLIFY_BASE_URL": "your-coolify-url",
        "COOLIFY_TOKEN": "your-api-token"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Available Tools

#### Version & Health
- `coolify_version`: Get Coolify version information
- `coolify_health`: Check Coolify API health status

#### Teams
- `list_teams`: List all teams
- `get_team`: Get details of a specific team
- `get_current_team`: Get current team details
- `get_current_team_members`: Get current team members

#### Servers
- `list_servers`: List all servers
- `create_server`: Create a new server
- `validate_server`: Validate server configuration
- `get_server_resources`: Get server resources
- `get_server_domains`: Get server domains

#### Projects
- `list_projects`: List all projects
- `get_project`: Get project details
- `create_project`: Create a new project
- `update_project`: Update project settings
- `delete_project`: Delete a project

#### Applications
- `list_applications`: List all applications
- `get_application`: Get application details
- `create_application`: Create a new application
- `update_application`: Update application settings
- `delete_application`: Delete an application
- `start_application`: Start an application
- `stop_application`: Stop an application
- `restart_application`: Restart an application
- `execute_command`: Execute command in application container
- `get_application_logs`: Get application logs

#### Databases
- `list_databases`: List all databases
- `get_database`: Get database details
- `create_database`: Create a new database
- `update_database`: Update database settings
- `delete_database`: Delete a database
- `start_database`: Start a database
- `stop_database`: Stop a database
- `restart_database`: Restart a database

#### Services
- `list_services`: List all services
- `get_service`: Get service details
- `create_service`: Create a new service
- `update_service`: Update service settings
- `delete_service`: Delete a service
- `start_service`: Start a service
- `stop_service`: Stop a service
- `restart_service`: Restart a service

#### Environment Variables
- `list_environment_variables`: List environment variables
- `create_environment_variable`: Create a new environment variable
- `update_environment_variable`: Update an environment variable
- `delete_environment_variable`: Delete an environment variable

#### Deployments
- `list_deployments`: List all deployments
- `get_deployment`: Get deployment details
- `deploy_webhook`: Trigger deployment via webhook

#### Private Keys
- `list_private_keys`: List all private keys
- `create_private_key`: Create a new private key
- `update_private_key`: Update a private key
- `delete_private_key`: Delete a private key

### Pre-configured Prompts

The server includes helpful prompts for common workflows:

- `deploy-git-app`: Deploy a new application from a Git repository
- `setup-database`: Set up a new database with proper configuration
- `deploy-service`: Deploy a pre-configured service
- `environment-setup`: Set up environment variables for an application
- `server-health-check`: Comprehensive health check of all servers
- `backup-database`: Create a backup of a database
- `scale-application`: Scale an application by adjusting resources
- `setup-ssl`: Configure SSL/TLS for an application
- `migrate-application`: Migrate an application between servers
- `troubleshoot-deployment`: Troubleshoot a failed deployment

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/pashvc/mcp-server-coolify.git
cd mcp-server-coolify

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Scripts

- `npm run build`: Build the TypeScript project
- `npm run watch`: Build and watch for changes
- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:integration`: Run integration tests only (requires env vars)
- `npm run inspector`: Launch MCP Inspector for debugging

## Troubleshooting

### Common Issues

- **404 Errors**: Some endpoints may not be available in all Coolify versions. The server automatically handles different response formats across versions.
- **Authentication Errors**: Ensure your API token has the required permissions (read, write, deploy).
- **Connection Issues**: Verify your `COOLIFY_BASE_URL` is correct and accessible.
- **Environment Variables**: Make sure both `COOLIFY_BASE_URL` and `COOLIFY_TOKEN` are set correctly.

### Testing Your Setup

```bash
# Test with your credentials
export COOLIFY_BASE_URL="https://your-coolify-instance.com"
export COOLIFY_TOKEN="your-api-token"

# Run integration tests to verify connectivity
npm run test:integration

# Or test the server directly
npm run build && npm start
```

### API Compatibility

The server handles different response formats automatically:
- **Version endpoint**: Supports both string and object responses
- **List endpoints**: Handles both direct arrays and paginated responses
- **Health endpoint**: Adapts to different status response formats
- **Error handling**: Robust parsing of various error message formats

## License

MIT

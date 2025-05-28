# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the coolify-mcp-server repository.

## Repository Overview

This is an MCP (Model Context Protocol) server that provides comprehensive integration with the Coolify API. It enables AI assistants to manage infrastructure, applications, databases, and services through Coolify's self-hosted PaaS platform.

**Current Status:** ✅ Production ready with comprehensive API coverage and robust error handling.
**Tested Version:** Coolify 4.0.0-beta.418

## Architecture

The codebase follows a layered architecture pattern:

```
src/
├── index.ts          # MCP server entry point and tool registration
├── services/         # API client layer (CoolifyClient)
├── tools/           # MCP tool implementations (CoolifyTools)
├── types/           # TypeScript interfaces for API types
└── prompts/         # Pre-configured workflow prompts
```

### Key Components

1. **Service Layer (`services/coolify-client.ts`)**
   - Handles all HTTP communication with Coolify API
   - Manages authentication and error handling
   - Returns strongly-typed responses
   - Throws structured errors with context

2. **Tool Layer (`tools/coolify-tools.ts`)**
   - Wraps service methods with MCP-specific logic
   - Validates inputs using Zod schemas
   - Formats responses for MCP consumption
   - Handles error transformation

3. **Type Definitions (`types/coolify.ts`)**
   - Comprehensive TypeScript interfaces for all API entities
   - Request/response types for each endpoint
   - Error types with proper structure

4. **Prompts (`prompts/index.ts`)**
   - Pre-configured workflows for common tasks
   - Template-based approach for complex operations
   - Guides users through multi-step processes

## Development Guidelines

### Running the Server

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start

# Development mode with watch
npm run watch

# Test with MCP Inspector
npm run inspector
```

### Environment Variables

Required environment variables:
- `COOLIFY_BASE_URL`: Base URL of your Coolify instance (e.g., https://coolify.example.com)
- `COOLIFY_TOKEN`: API token from Coolify settings

### Testing

The project has comprehensive test coverage with both unit and integration tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests only (requires env vars)
npm run test:integration

# Run specific test patterns
npm test -- --testPathPattern="tools.test"
npm test -- --testPathPattern="integration"
```

**Environment Variables for Integration Tests:**
```bash
export COOLIFY_BASE_URL="https://your-coolify-instance.com"
export COOLIFY_TOKEN="your-api-token"
```

**Test Coverage:**
- Unit tests: Tools layer validation and error handling
- Integration tests: Real API calls against live Coolify instance
- All 43 MCP tools are tested and verified working

### Adding New Features

1. **New API Endpoint**:
   - Add types to `types/coolify.ts`
   - Implement method in `services/coolify-client.ts`
   - Create tool wrapper in `tools/coolify-tools.ts`
   - Register tool in `index.ts`
   - Add tests for both service and tool layers

2. **New Tool**:
   - Define Zod schema for input validation
   - Implement tool method with error handling
   - Register in the tools array in `index.ts`
   - Document the tool's purpose and parameters

3. **New Prompt**:
   - Add to the prompts array in `prompts/index.ts`
   - Include clear steps and expected outcomes
   - Test the workflow end-to-end

## API Coverage

### Implemented Endpoints

**Version & Health**
- GET /version
- GET /health

**Teams**
- GET /teams
- GET /teams/{id}
- GET /teams/current
- GET /teams/current/members

**Servers**
- GET /servers
- POST /servers
- GET /servers/{uuid}/validate
- GET /servers/{uuid}/resources
- GET /servers/{uuid}/domains

**Projects**
- GET /projects
- GET /projects/{id}
- POST /projects
- PUT /projects/{id}
- DELETE /projects/{id}

**Applications**
- GET /applications
- GET /applications/{uuid}
- POST /applications
- PUT /applications/{uuid}
- DELETE /applications/{uuid}
- GET /applications/{uuid}/start
- GET /applications/{uuid}/stop
- GET /applications/{uuid}/restart
- POST /applications/{uuid}/execute
- GET /applications/{uuid}/logs

**Databases**
- GET /databases
- GET /databases/{uuid}
- POST /databases
- PUT /databases/{uuid}
- DELETE /databases/{uuid}
- GET /databases/{uuid}/start
- GET /databases/{uuid}/stop
- GET /databases/{uuid}/restart

**Services**
- GET /services
- GET /services/{uuid}
- POST /services
- PUT /services/{uuid}
- DELETE /services/{uuid}
- GET /services/{uuid}/start
- GET /services/{uuid}/stop
- GET /services/{uuid}/restart

**Environment Variables**
- GET /{resource}s/{uuid}/envs
- GET /{resource}s/{uuid}/envs/{id}
- POST /{resource}s/{uuid}/envs
- PUT /{resource}s/{uuid}/envs/{id}
- DELETE /{resource}s/{uuid}/envs/{id}

**Deployments**
- GET /deployments
- GET /deployments/{uuid}
- POST /deploy

**Private Keys**
- GET /security/keys
- POST /security/keys
- PUT /security/keys/{uuid}
- DELETE /security/keys/{uuid}

## Error Handling

The server implements comprehensive error handling:

1. **Service Layer**: Throws structured `CoolifyApiError` with:
   - `message`: Human-readable error message
   - `errors`: Field-specific validation errors
   - `status`: HTTP status code

2. **Tool Layer**: Catches errors and returns MCP error format:
   - `isError: true`
   - `content`: Array with error details

3. **Input Validation**: Uses Zod for schema validation
   - Provides clear error messages
   - Validates types, formats, and constraints

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces
2. **Error Context**: Include relevant context in errors
3. **Validation**: Validate inputs before API calls
4. **Testing**: Write both unit and integration tests
5. **Documentation**: Document new tools and their parameters
6. **Prompts**: Create prompts for complex workflows

## API Response Handling

The server includes robust handling for different Coolify API response formats:

### Version Compatibility
- **Version endpoint**: Handles both string responses (`"4.0.0-beta.418"`) and object responses (`{"version": "4.0.0"}`)
- **Health endpoint**: Adapts to string responses (`"OK"`) and structured health objects
- **List endpoints**: Supports both direct arrays and paginated responses with `data` wrapper

### Error Handling
- Comprehensive error parsing with field-specific validation messages
- HTTP status code mapping and context preservation
- Graceful handling of different error response formats
- User-friendly error messages with actionable information

### Response Format Examples
```typescript
// Version endpoint variations
"4.0.0-beta.418" → { version: "4.0.0-beta.418" }
{ version: "4.0.0", build_date: "2024-01-01" } → unchanged

// List endpoint variations  
[{...}, {...}] → extractListData([{...}, {...}])
{ data: [{...}, {...}], meta: {...} } → extractListData(response.data)

// Health endpoint variations
"OK" → { status: "OK", timestamp: "2024-01-01T00:00:00Z" }
{ status: "healthy", services: {...} } → unchanged
```

## Known Limitations

- Some endpoints may return 404 in certain Coolify versions (automatically handled)
- Execute command endpoint requires specific Coolify configuration
- API rate limits may apply depending on Coolify instance
- Field availability varies between Coolify versions (tests account for this)

## Contributing

When contributing:
1. Follow the existing architecture patterns
2. Add comprehensive tests
3. Update type definitions
4. Document new features
5. Ensure backward compatibility
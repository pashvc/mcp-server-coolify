# Changelog

All notable changes to the coolify-mcp-server will be documented in this file.

## [1.0.0] - 2024-01-30

### 🎉 Major Release - Production Ready

This release represents a complete overhaul of the coolify-mcp-server with comprehensive improvements in architecture, API coverage, and reliability.

### ✨ New Features

#### Complete API Coverage
- **Projects**: Full CRUD operations (create, read, update, delete)
- **Applications**: Enhanced with logs, command execution, full lifecycle management  
- **Databases**: Support for PostgreSQL, MySQL, MariaDB, MongoDB, Redis with full CRUD
- **Services**: Complete service lifecycle management with CRUD operations
- **Environment Variables**: Comprehensive management for all resource types
- **Private Keys**: Full key management with update and delete operations
- **Deployments**: Enhanced with webhook triggers and detailed logging

#### Pre-configured Prompts
- `deploy-git-app`: Deploy applications from Git repositories
- `setup-database`: Guided database setup with best practices
- `deploy-service`: Deploy pre-configured services (Plausible, Umami, etc.)
- `environment-setup`: Bulk environment variable configuration
- `server-health-check`: Comprehensive infrastructure health monitoring
- `backup-database`: Database backup workflows
- `scale-application`: Resource scaling and optimization
- `setup-ssl`: SSL/TLS configuration automation
- `migrate-application`: Cross-server application migration
- `troubleshoot-deployment`: Deployment issue diagnosis

### 🏗️ Architecture Improvements

#### Service Layer Pattern
- Extracted `CoolifyClient` class for centralized API communication
- Separated concerns between API logic and MCP tool definitions
- Comprehensive error handling with structured error types
- Robust response format handling for different Coolify versions

#### Tool Layer Enhancement
- Created `CoolifyTools` class wrapping service methods with MCP-specific logic
- Added Zod schema validation for all tool inputs
- Consistent error formatting for MCP responses
- Proper type safety throughout the stack

#### Type Safety
- Comprehensive TypeScript interfaces for all API entities (`types/coolify.ts`)
- Request/response types for each endpoint
- Proper error types with field-specific validation
- Full type coverage with strict TypeScript configuration

### 🔧 API Compatibility

#### Multi-Version Support
- **Version endpoint**: Handles both string (`"4.0.0-beta.418"`) and object responses
- **Health endpoint**: Adapts to string (`"OK"`) and structured health responses  
- **List endpoints**: Supports both direct arrays and paginated responses
- **Error handling**: Robust parsing of various error message formats

#### Response Format Adaptation
```typescript
// Automatic handling of different response formats
"4.0.0-beta.418" → { version: "4.0.0-beta.418" }
[{...}, {...}] → extractListData([{...}, {...}])
{ data: [{...}], meta: {...} } → extractListData(response.data)
```

### 🧪 Testing Infrastructure

#### Comprehensive Test Coverage
- **Unit Tests**: Tools layer validation and error handling (20 tests)
- **Integration Tests**: Real API calls against live Coolify instance (18 tests)
- **Total Coverage**: 38/38 tests passing with real-world validation

#### Test Environment
- Jest configuration with ES modules support
- Integration tests with live Coolify 4.0.0-beta.418 instance
- Automated CI-ready test structure
- Mock-free integration testing for maximum confidence

### 🛠️ Developer Experience

#### Enhanced Development Tools
- TypeScript strict mode with full type safety
- Jest test framework with watch mode and coverage
- MCP Inspector support for debugging
- Development server with hot reload
- Comprehensive error messages with actionable context

#### Build & Deployment
- ES2022 target with Node16 module system  
- Optimized build process with executable permissions
- Production-ready Docker support
- NPM package with proper bin configuration

### 🔧 Infrastructure

#### Environment Variables
- `COOLIFY_BASE_URL`: Coolify instance URL
- `COOLIFY_TOKEN`: API token with required permissions
- Comprehensive validation and error reporting

#### Tool Coverage (43 tools total)
- **Version & Health**: 2 tools
- **Teams**: 4 tools  
- **Servers**: 5 tools
- **Projects**: 5 tools
- **Applications**: 9 tools
- **Databases**: 7 tools
- **Services**: 7 tools
- **Environment Variables**: 4 tools
- **Deployments**: 3 tools  
- **Private Keys**: 4 tools

### 🐛 Bug Fixes

- Fixed TypeScript compilation errors with proper import paths
- Resolved API response format inconsistencies across Coolify versions
- Fixed error message parsing for different validation error formats
- Corrected tool registration and MCP schema definitions
- Resolved Jest configuration issues with ES modules

### 📚 Documentation

#### Updated Documentation
- Comprehensive README with all new features
- CLAUDE.md with development guidelines and API handling details
- Integration test documentation with setup instructions
- Troubleshooting guide with common issues and solutions

#### API Documentation
- Complete tool reference with input/output examples
- Prompt usage guidelines and workflow documentation
- Error handling reference with status codes
- Compatibility notes for different Coolify versions

### 🚀 Performance

- Optimized API client with connection reuse
- Efficient error handling without performance impact
- Streamlined tool execution with proper validation
- Memory-efficient response processing

### 🔐 Security

- Secure API token handling with environment variables
- Input validation using Zod schemas
- Proper error sanitization without sensitive data leakage
- Rate limiting awareness and handling

### ⚠️ Breaking Changes

This release includes significant architectural changes from v0.x:

1. **File Structure**: Moved to layered architecture (services/, tools/, types/, prompts/)
2. **Tool Names**: Some tools renamed for consistency (e.g., `get_version` → `coolify_version`)
3. **Error Format**: Standardized error responses across all tools
4. **Response Format**: Improved response formatting for better readability

### 📦 Dependencies

- Updated `@modelcontextprotocol/sdk` to v0.6.0
- Added `zod` v3.22.4 for runtime validation
- Enhanced development dependencies with Jest and ts-jest
- Node.js 18+ requirement for ESM support

### 🎯 Compatibility

- **Tested with**: Coolify 4.0.0-beta.418
- **Node.js**: 18.0.0 or higher
- **MCP SDK**: 0.6.0 or higher
- **Platform**: macOS, Linux, Windows (with WSL)

---

## [0.1.11] - Previous Release

### Features
- Basic Coolify API integration
- Limited tool coverage
- Single-file architecture
- Basic error handling

### Limitations
- Monolithic structure
- Limited API coverage
- No testing infrastructure
- Basic error handling
- No type safety
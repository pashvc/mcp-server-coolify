import { jest } from '@jest/globals';
import { CoolifyTools } from './coolify-tools.js';
import { CoolifyClient } from '../services/coolify-client.js';

// Create a mock client manually
const createMockClient = (): jest.Mocked<CoolifyClient> => {
  return {
    getVersion: jest.fn(),
    listTeams: jest.fn(),
    createApplication: jest.fn(),
    createEnvironmentVariable: jest.fn(),
    listApplications: jest.fn(),
  } as any;
};

describe('CoolifyTools', () => {
  let tools: CoolifyTools;
  let mockClient: jest.Mocked<CoolifyClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    tools = new CoolifyTools(mockClient);
  });

  describe('getVersion', () => {
    it('should return formatted version information', async () => {
      mockClient.getVersion.mockResolvedValue({
        version: '4.0.0',
        build_date: '2024-01-01',
        commit_hash: 'abc123',
      });

      const result = await tools.getVersion();

      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'Coolify Version: 4.0.0\nBuild Date: 2024-01-01\nCommit: abc123',
        }],
      });
    });

    it('should handle errors gracefully', async () => {
      mockClient.getVersion.mockRejectedValue({
        message: 'API Error',
        status: 500,
      });

      const result = await tools.getVersion();

      expect(result).toEqual({
        isError: true,
        content: [{ type: 'text', text: '[500] API Error' }],
      });
    });
  });

  describe('listTeams', () => {
    it('should return formatted list of teams', async () => {
      mockClient.listTeams.mockResolvedValue([
        {
          id: 1,
          name: 'Team Alpha',
          personal_team: false,
          description: 'Main team',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 2,
          name: 'Personal Team',
          personal_team: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]);

      const result = await tools.listTeams();

      expect(result.content[0].text).toContain('ID: 1');
      expect(result.content[0].text).toContain('Name: Team Alpha');
      expect(result.content[0].text).toContain('Personal: No');
      expect(result.content[0].text).toContain('Description: Main team');
      expect(result.content[0].text).toContain('ID: 2');
      expect(result.content[0].text).toContain('Name: Personal Team');
      expect(result.content[0].text).toContain('Personal: Yes');
    });

    it('should handle empty results', async () => {
      mockClient.listTeams.mockResolvedValue([]);

      const result = await tools.listTeams();

      expect(result).toEqual({
        content: [{ type: 'text', text: 'No teams found' }],
      });
    });
  });

  describe('createApplication', () => {
    it('should validate input and create application', async () => {
      const input = {
        project_uuid: 'proj-123',
        server_uuid: 'srv-123',
        type: 'public',
        name: 'Test App',
        git_repository: 'https://github.com/test/app',
        git_branch: 'main',
      };

      mockClient.createApplication.mockResolvedValue({
        uuid: 'app-123',
        name: 'Test App',
        status: 'stopped',
        build_pack: 'nixpacks',
        id: 1,
        environment_id: 1,
        destination_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const result = await tools.createApplication(input);

      expect(mockClient.createApplication).toHaveBeenCalledWith(input);
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'Application created successfully!\nUUID: app-123\nName: Test App\nStatus: stopped',
        }],
      });
    });

    it('should handle validation errors', async () => {
      const input = {
        // Missing required fields
        name: 'Test App',
      };

      const result = await tools.createApplication(input);

      expect('isError' in result && result.isError).toBe(true);
      expect(mockClient.createApplication).not.toHaveBeenCalled();
    });
  });

  describe('createEnvironmentVariable', () => {
    it('should create environment variable with proper validation', async () => {
      const input = {
        resourceType: 'application',
        resourceUuid: 'app-123',
        key: 'NODE_ENV',
        value: 'production',
        is_build_time: true,
      };

      mockClient.createEnvironmentVariable.mockResolvedValue({
        id: 1,
        key: 'NODE_ENV',
        value: 'production',
        is_build_time: true,
        is_preview: false,
        application_id: 123,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const result = await tools.createEnvironmentVariable(input);

      expect(mockClient.createEnvironmentVariable).toHaveBeenCalledWith(
        'application',
        'app-123',
        {
          key: 'NODE_ENV',
          value: 'production',
          is_build_time: true,
        }
      );
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'Environment variable created: NODE_ENV=production',
        }],
      });
    });
  });

  describe('listApplications', () => {
    it('should return formatted list of applications', async () => {
      mockClient.listApplications.mockResolvedValue([
        {
          id: 1,
          uuid: 'app-123',
          name: 'Web App',
          status: 'running',
          build_pack: 'nixpacks',
          fqdn: 'https://app.example.com',
          git_repository: 'https://github.com/test/app',
          git_branch: 'main',
          environment_id: 1,
          destination_id: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]);

      const result = await tools.listApplications();

      expect(result.content[0].text).toContain('UUID: app-123');
      expect(result.content[0].text).toContain('Name: Web App');
      expect(result.content[0].text).toContain('Status: running');
      expect(result.content[0].text).toContain('Build Pack: nixpacks');
      expect(result.content[0].text).toContain('URL: https://app.example.com');
      expect(result.content[0].text).toContain('Repository: https://github.com/test/app');
      expect(result.content[0].text).toContain('Branch: main');
    });
  });

  describe('error formatting', () => {
    it('should format API errors with details', async () => {
      mockClient.getVersion.mockRejectedValue({
        message: 'Validation failed',
        errors: {
          name: ['Name is required', 'Name must be unique'],
          port: ['Port must be a number'],
        },
        status: 422,
      });

      const result = await tools.getVersion();

      expect('isError' in result && result.isError).toBe(true);
      expect(result.content[0].text).toContain('[422] Validation failed');
      expect(result.content[0].text).toContain('name: Name is required, Name must be unique');
      expect(result.content[0].text).toContain('port: Port must be a number');
    });

    it('should handle unknown errors', async () => {
      mockClient.getVersion.mockRejectedValue('Unknown error');

      const result = await tools.getVersion();

      expect(result).toEqual({
        isError: true,
        content: [{ type: 'text', text: 'An unexpected error occurred' }],
      });
    });
  });
});
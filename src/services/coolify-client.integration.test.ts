import { CoolifyClient } from './coolify-client.js';

// Skip these tests if environment variables are not set
const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

const describeFn = COOLIFY_BASE_URL && COOLIFY_TOKEN ? describe : describe.skip;

describeFn('CoolifyClient Integration Tests', () => {
  let client: CoolifyClient;

  beforeAll(() => {
    client = new CoolifyClient(COOLIFY_TOKEN!, COOLIFY_BASE_URL!);
  });

  describe('Version & Health', () => {
    it('should get version information', async () => {
      const version = await client.getVersion();
      
      expect(version).toBeDefined();
      expect(version.version).toBeTruthy();
      expect(typeof version.version).toBe('string');
    });

    it('should check health status', async () => {
      const health = await client.checkHealth();
      
      expect(health).toBeDefined();
      expect(health.status).toBeTruthy();
      expect(health.timestamp).toBeTruthy();
    });
  });

  describe('Teams', () => {
    it('should list teams', async () => {
      const teams = await client.listTeams();
      
      expect(Array.isArray(teams)).toBe(true);
      expect(teams.length).toBeGreaterThan(0);
      
      if (teams.length > 0) {
        const team = teams[0];
        expect(team.id).toBeDefined();
        expect(team.name).toBeDefined();
        expect(typeof team.personal_team).toBe('boolean');
      }
    });

    it('should get current team', async () => {
      const team = await client.getCurrentTeam();
      
      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.name).toBeDefined();
    });

    it('should get current team members', async () => {
      const members = await client.getCurrentTeamMembers();
      
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
      
      if (members.length > 0) {
        const member = members[0];
        expect(member.id).toBeDefined();
        expect(member.name).toBeDefined();
        expect(member.email).toBeDefined();
        // Note: role field might not be present in all versions
      }
    });
  });

  describe('Servers', () => {
    it('should list servers', async () => {
      const servers = await client.listServers();
      
      expect(Array.isArray(servers)).toBe(true);
      
      if (servers.length > 0) {
        const server = servers[0];
        expect(server.uuid).toBeDefined();
        expect(server.name).toBeDefined();
        expect(server.ip).toBeDefined();
        expect(server.port).toBeDefined();
      }
    });
  });

  describe('Projects', () => {
    it('should list projects', async () => {
      const projects = await client.listProjects();
      
      expect(Array.isArray(projects)).toBe(true);
      
      if (projects.length > 0) {
        const project = projects[0];
        expect(project.uuid).toBeDefined();
        expect(project.name).toBeDefined();
        // Note: team_id field might not be present in all API responses
      }
    });
  });

  describe('Applications', () => {
    it('should list applications', async () => {
      const applications = await client.listApplications();
      
      expect(Array.isArray(applications)).toBe(true);
      
      if (applications.length > 0) {
        const app = applications[0];
        expect(app.uuid).toBeDefined();
        expect(app.name).toBeDefined();
        expect(app.status).toBeDefined();
        expect(app.build_pack).toBeDefined();
      }
    });
  });

  describe('Private Keys', () => {
    it('should list private keys', async () => {
      const keys = await client.listPrivateKeys();
      
      expect(Array.isArray(keys)).toBe(true);
      
      if (keys.length > 0) {
        const key = keys[0];
        expect(key.uuid).toBeDefined();
        expect(key.name).toBeDefined();
        expect(key.team_id).toBeDefined();
      }
    });
  });
});
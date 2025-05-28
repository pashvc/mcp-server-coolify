import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  CoolifyVersion,
  CoolifyHealth,
  CoolifyTeam,
  CoolifyTeamMember,
  CoolifyServer,
  CoolifyServerValidation,
  CoolifyResource,
  CoolifyDomain,
  CoolifyService,
  CoolifyApplication,
  CoolifyDatabase,
  CoolifyProject,
  CoolifyEnvironment,
  CoolifyEnvironmentVariable,
  CoolifyDeployment,
  CoolifyPrivateKey,
  CoolifyCreateServerRequest,
  CoolifyCreateApplicationRequest,
  CoolifyCreateDatabaseRequest,
  CoolifyCreateServiceRequest,
  CoolifyCreateProjectRequest,
  CoolifyCreateEnvironmentVariableRequest,
  CoolifyExecuteCommandRequest,
  CoolifyExecuteCommandResponse,
  CoolifyApiError,
  CoolifyListResponse,
} from '../types/coolify.js';

export class CoolifyClient {
  private client: AxiosInstance;

  constructor(apiToken: string, baseUrl: string) {
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  private async handleError(error: unknown): Promise<never> {
    if (error instanceof AxiosError) {
      const apiError: CoolifyApiError = {
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
      };
      throw apiError;
    }
    throw error;
  }

  private extractListData<T>(data: T[] | CoolifyListResponse<T>): T[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data.data || [];
  }

  // Version & Health
  async getVersion(): Promise<CoolifyVersion> {
    try {
      const response = await this.client.get<string>('/version');
      // Handle the case where version is returned as a string
      if (typeof response.data === 'string') {
        return { version: response.data };
      }
      return response.data as CoolifyVersion;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkHealth(): Promise<CoolifyHealth> {
    try {
      const response = await this.client.get<string | CoolifyHealth>('/health');
      // Handle the case where health is returned as a string
      if (typeof response.data === 'string') {
        return { 
          status: response.data, 
          timestamp: new Date().toISOString()
        };
      }
      return response.data as CoolifyHealth;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Teams
  async listTeams(): Promise<CoolifyTeam[]> {
    try {
      const response = await this.client.get<CoolifyTeam[] | CoolifyListResponse<CoolifyTeam>>('/teams');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTeam(teamId: number): Promise<CoolifyTeam> {
    try {
      const response = await this.client.get<CoolifyTeam>(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentTeam(): Promise<CoolifyTeam> {
    try {
      const response = await this.client.get<CoolifyTeam>('/teams/current');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentTeamMembers(): Promise<CoolifyTeamMember[]> {
    try {
      const response = await this.client.get<CoolifyTeamMember[] | CoolifyListResponse<CoolifyTeamMember>>('/teams/current/members');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Servers
  async listServers(): Promise<CoolifyServer[]> {
    try {
      const response = await this.client.get<CoolifyServer[] | CoolifyListResponse<CoolifyServer>>('/servers');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createServer(data: CoolifyCreateServerRequest): Promise<CoolifyServer> {
    try {
      const response = await this.client.post<CoolifyServer>('/servers', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async validateServer(uuid: string): Promise<CoolifyServerValidation> {
    try {
      const response = await this.client.get<CoolifyServerValidation>(`/servers/${uuid}/validate`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getServerResources(uuid: string): Promise<CoolifyResource[]> {
    try {
      const response = await this.client.get<CoolifyResource[] | CoolifyListResponse<CoolifyResource>>(`/servers/${uuid}/resources`);
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getServerDomains(uuid: string): Promise<CoolifyDomain[]> {
    try {
      const response = await this.client.get<CoolifyDomain[] | CoolifyListResponse<CoolifyDomain>>(`/servers/${uuid}/domains`);
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Projects
  async listProjects(): Promise<CoolifyProject[]> {
    try {
      const response = await this.client.get<CoolifyProject[] | CoolifyListResponse<CoolifyProject>>('/projects');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProject(projectId: number): Promise<CoolifyProject> {
    try {
      const response = await this.client.get<CoolifyProject>(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createProject(data: CoolifyCreateProjectRequest): Promise<CoolifyProject> {
    try {
      const response = await this.client.post<CoolifyProject>('/projects', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProject(projectId: number, data: Partial<CoolifyCreateProjectRequest>): Promise<CoolifyProject> {
    try {
      const response = await this.client.put<CoolifyProject>(`/projects/${projectId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteProject(projectId: number): Promise<void> {
    try {
      await this.client.delete(`/projects/${projectId}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Applications
  async listApplications(): Promise<CoolifyApplication[]> {
    try {
      const response = await this.client.get<CoolifyApplication[] | CoolifyListResponse<CoolifyApplication>>('/applications');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getApplication(uuid: string): Promise<CoolifyApplication> {
    try {
      const response = await this.client.get<CoolifyApplication>(`/applications/${uuid}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createApplication(data: CoolifyCreateApplicationRequest): Promise<CoolifyApplication> {
    try {
      const response = await this.client.post<CoolifyApplication>('/applications', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateApplication(uuid: string, data: Partial<CoolifyCreateApplicationRequest>): Promise<CoolifyApplication> {
    try {
      const response = await this.client.put<CoolifyApplication>(`/applications/${uuid}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteApplication(uuid: string): Promise<void> {
    try {
      await this.client.delete(`/applications/${uuid}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startApplication(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/applications/${uuid}/start`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async stopApplication(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/applications/${uuid}/stop`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async restartApplication(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/applications/${uuid}/restart`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async executeCommand(uuid: string, data: CoolifyExecuteCommandRequest): Promise<CoolifyExecuteCommandResponse> {
    try {
      const response = await this.client.post<CoolifyExecuteCommandResponse>(`/applications/${uuid}/execute`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getApplicationLogs(uuid: string, since?: number): Promise<string> {
    try {
      const params = since ? { since } : {};
      const response = await this.client.get<{ logs: string }>(`/applications/${uuid}/logs`, { params });
      return response.data.logs;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Databases
  async listDatabases(): Promise<CoolifyDatabase[]> {
    try {
      const response = await this.client.get<CoolifyDatabase[] | CoolifyListResponse<CoolifyDatabase>>('/databases');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDatabase(uuid: string): Promise<CoolifyDatabase> {
    try {
      const response = await this.client.get<CoolifyDatabase>(`/databases/${uuid}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createDatabase(data: CoolifyCreateDatabaseRequest): Promise<CoolifyDatabase> {
    try {
      const response = await this.client.post<CoolifyDatabase>('/databases', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateDatabase(uuid: string, data: Partial<CoolifyCreateDatabaseRequest>): Promise<CoolifyDatabase> {
    try {
      const response = await this.client.put<CoolifyDatabase>(`/databases/${uuid}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteDatabase(uuid: string): Promise<void> {
    try {
      await this.client.delete(`/databases/${uuid}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startDatabase(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/databases/${uuid}/start`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async stopDatabase(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/databases/${uuid}/stop`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async restartDatabase(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/databases/${uuid}/restart`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Services
  async listServices(): Promise<CoolifyService[]> {
    try {
      const response = await this.client.get<CoolifyService[] | CoolifyListResponse<CoolifyService>>('/services');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getService(uuid: string): Promise<CoolifyService> {
    try {
      const response = await this.client.get<CoolifyService>(`/services/${uuid}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createService(data: CoolifyCreateServiceRequest): Promise<CoolifyService> {
    try {
      const response = await this.client.post<CoolifyService>('/services', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateService(uuid: string, data: Partial<CoolifyCreateServiceRequest>): Promise<CoolifyService> {
    try {
      const response = await this.client.put<CoolifyService>(`/services/${uuid}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteService(uuid: string): Promise<void> {
    try {
      await this.client.delete(`/services/${uuid}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startService(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/services/${uuid}/start`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async stopService(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/services/${uuid}/stop`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async restartService(uuid: string): Promise<{ message: string }> {
    try {
      const response = await this.client.get<{ message: string }>(`/services/${uuid}/restart`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Environment Variables
  async listEnvironmentVariables(
    resourceType: 'application' | 'service' | 'database',
    resourceUuid: string
  ): Promise<CoolifyEnvironmentVariable[]> {
    try {
      const response = await this.client.get<CoolifyEnvironmentVariable[] | CoolifyListResponse<CoolifyEnvironmentVariable>>(
        `/${resourceType}s/${resourceUuid}/envs`
      );
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getEnvironmentVariable(
    resourceType: 'application' | 'service' | 'database',
    resourceUuid: string,
    envId: number
  ): Promise<CoolifyEnvironmentVariable> {
    try {
      const response = await this.client.get<CoolifyEnvironmentVariable>(
        `/${resourceType}s/${resourceUuid}/envs/${envId}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createEnvironmentVariable(
    resourceType: 'application' | 'service' | 'database',
    resourceUuid: string,
    data: CoolifyCreateEnvironmentVariableRequest
  ): Promise<CoolifyEnvironmentVariable> {
    try {
      const response = await this.client.post<CoolifyEnvironmentVariable>(
        `/${resourceType}s/${resourceUuid}/envs`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateEnvironmentVariable(
    resourceType: 'application' | 'service' | 'database',
    resourceUuid: string,
    envId: number,
    data: Partial<CoolifyCreateEnvironmentVariableRequest>
  ): Promise<CoolifyEnvironmentVariable> {
    try {
      const response = await this.client.put<CoolifyEnvironmentVariable>(
        `/${resourceType}s/${resourceUuid}/envs/${envId}`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteEnvironmentVariable(
    resourceType: 'application' | 'service' | 'database',
    resourceUuid: string,
    envId: number
  ): Promise<void> {
    try {
      await this.client.delete(`/${resourceType}s/${resourceUuid}/envs/${envId}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Deployments
  async listDeployments(): Promise<CoolifyDeployment[]> {
    try {
      const response = await this.client.get<CoolifyDeployment[] | CoolifyListResponse<CoolifyDeployment>>('/deployments');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDeployment(uuid: string): Promise<CoolifyDeployment> {
    try {
      const response = await this.client.get<CoolifyDeployment>(`/deployments/${uuid}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deployByWebhook(uuid: string, tag?: string): Promise<{ message: string; deployment_uuid: string }> {
    try {
      const response = await this.client.post<{ message: string; deployment_uuid: string }>('/deploy', {
        uuid,
        tag,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private Keys
  async listPrivateKeys(): Promise<CoolifyPrivateKey[]> {
    try {
      const response = await this.client.get<CoolifyPrivateKey[] | CoolifyListResponse<CoolifyPrivateKey>>('/security/keys');
      return this.extractListData(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createPrivateKey(data: { name: string; description?: string; private_key: string }): Promise<CoolifyPrivateKey> {
    try {
      const response = await this.client.post<CoolifyPrivateKey>('/security/keys', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updatePrivateKey(
    uuid: string,
    data: { name?: string; description?: string; private_key?: string }
  ): Promise<CoolifyPrivateKey> {
    try {
      const response = await this.client.put<CoolifyPrivateKey>(`/security/keys/${uuid}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deletePrivateKey(uuid: string): Promise<void> {
    try {
      await this.client.delete(`/security/keys/${uuid}`);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
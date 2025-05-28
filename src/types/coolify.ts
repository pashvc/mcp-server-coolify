export interface CoolifyVersion {
  version: string;
  build_date?: string;
  commit_hash?: string;
}

export interface CoolifyHealth {
  status: string;
  timestamp: string;
  services?: {
    database: boolean;
    redis: boolean;
    docker: boolean;
  };
}

export interface CoolifyTeam {
  id: number;
  name: string;
  description?: string;
  personal_team: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoolifyTeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface CoolifyServer {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  ip: string;
  port: number;
  user: string;
  private_key_id: number;
  team_id: number;
  proxy?: {
    type: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CoolifyServerValidation {
  server: string;
  status: string;
  message?: string;
  errors?: string[];
}

export interface CoolifyResource {
  id: number;
  uuid: string;
  name: string;
  type: 'application' | 'service' | 'database';
  status: string;
  fqdn?: string;
  created_at: string;
}

export interface CoolifyDomain {
  id: number;
  domain: string;
  resource_type: string;
  resource_id: number;
  created_at: string;
}

export interface CoolifyService {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  type: string;
  version?: string;
  status: string;
  fqdn?: string;
  environment_id: number;
  server_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyApplication {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  git_repository?: string;
  git_branch?: string;
  git_commit_sha?: string;
  build_pack: string;
  status: string;
  fqdn?: string;
  port_mappings?: string;
  port_exposes?: string;
  environment_id: number;
  destination_id: number;
  source_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyDatabase {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
  version: string;
  status: string;
  public_port?: number;
  environment_id: number;
  destination_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyProject {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  team_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyEnvironment {
  id: number;
  name: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyEnvironmentVariable {
  id: number;
  key: string;
  value: string;
  is_build_time: boolean;
  is_preview: boolean;
  application_id?: number;
  service_id?: number;
  database_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyDeployment {
  id: number;
  uuid: string;
  application_id: number;
  deployment_uuid: string;
  pull_request_id?: number;
  force_rebuild: boolean;
  commit?: string;
  status: string;
  is_webhook: boolean;
  logs?: string;
  created_at: string;
  updated_at: string;
}

export interface CoolifyPrivateKey {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  private_key: string;
  team_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyCreateServerRequest {
  name: string;
  description?: string;
  ip: string;
  port?: number;
  user?: string;
  private_key_uuid: string;
  is_build_server?: boolean;
  instant_validate?: boolean;
}

export interface CoolifyCreateApplicationRequest {
  project_uuid: string;
  environment_name?: string;
  server_uuid: string;
  type: 'public' | 'private';
  name: string;
  description?: string;
  git_repository?: string;
  git_branch?: string;
  git_commit_sha?: string;
  ports_exposes?: string;
  ports_mappings?: string;
  build_pack?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  base_directory?: string;
  publish_directory?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  custom_labels?: string;
  dockerfile?: string;
  dockerfile_location?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  static_image?: string;
  watch_paths?: string;
  docker_compose_location?: string;
  docker_compose_raw?: string;
  docker_compose_custom_start_command?: string;
  docker_compose_custom_build_command?: string;
  docker_compose_domains?: string;
  docker_compose?: string;
  instant_deploy?: boolean;
}

export interface CoolifyCreateDatabaseRequest {
  project_uuid: string;
  environment_name?: string;
  server_uuid: string;
  type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
  name: string;
  description?: string;
  version?: string;
  public_port?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  postgres_user?: string;
  postgres_password?: string;
  postgres_db?: string;
  postgres_init_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_database?: string;
  mysql_root_password?: string;
  mysql_conf?: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mariadb_root_password?: string;
  mariadb_conf?: string;
  mongo_initdb_root_username?: string;
  mongo_initdb_root_password?: string;
  mongo_initdb_database?: string;
  mongo_conf?: string;
  redis_password?: string;
  redis_conf?: string;
  instant_deploy?: boolean;
}

export interface CoolifyCreateServiceRequest {
  project_uuid: string;
  environment_name?: string;
  server_uuid: string;
  type: string;
  name: string;
  description?: string;
  instant_deploy?: boolean;
}

export interface CoolifyCreateProjectRequest {
  name: string;
  description?: string;
}

export interface CoolifyCreateEnvironmentVariableRequest {
  key: string;
  value: string;
  is_build_time?: boolean;
  is_preview?: boolean;
  is_shared?: boolean;
}

export interface CoolifyExecuteCommandRequest {
  command: string;
  workDir?: string;
}

export interface CoolifyExecuteCommandResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CoolifyApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface CoolifyListResponse<T> {
  data: T[];
  links?: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
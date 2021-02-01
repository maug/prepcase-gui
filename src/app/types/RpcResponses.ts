import { NamelistsByComponent } from './namelists';

export interface RpcExecuteCommandResponse {
  command: string;
  return_code: number;
  stderr: string;
  stdout: string;
}

export interface RpcLoginResponse {
  config: any;
  error: string;
  error_code: 'permission_denied' | 'no_prepcase_file' | 'invalid_prepcase_file' | 'error' | '';
  hostname: string;
  ssh: RpcExecuteCommandResponse;
}

export interface RpcCaseListResponse {
  [parentDir: string]: string[];
}

export interface RpcAddNewCasePathResponse {
  caseDirs: string[];
}

export interface RpcNamelistsResponse {
  error: string;
  namelists: NamelistsByComponent;
}

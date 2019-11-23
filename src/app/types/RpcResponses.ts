interface RpcExecuteCommandResponse {
  command: string;
  return_code: number;
  stderr: string;
  stdout: string;
}

interface RpcLoginResponse {
  config: any;
  error: string;
  error_code: 'permission_denied' | 'no_prepcase_file' | 'error' | '';
  ssh: RpcExecuteCommandResponse;
}

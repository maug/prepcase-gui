interface RpcExecuteCommandResponse {
  command: string;
  return_code: number;
  stderr: string;
  stdout: string;
}

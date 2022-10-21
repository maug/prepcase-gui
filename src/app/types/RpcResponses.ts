import { NamelistsByComponent } from './namelists'
import { SuiteConfiguration, SuiteProcessDetails, SuiteProcessDetailsWithOutput } from './suites'

export interface RpcExecuteCommandResponse {
  command: string
  return_code: number
  stderr: string
  stdout: string
}

export interface RpcLoginResponse {
  config: any
  error: string
  error_code: 'permission_denied' | 'no_prepcase_file' | 'invalid_prepcase_file' | 'error' | ''
  hostname: string
  ssh: RpcExecuteCommandResponse
}

export interface RpcCaseListResponse {
  [parentDir: string]: string[]
}

export type RpcAddNewCasePathResponse = string[]

export interface RpcNamelistsResponse {
  namelists: NamelistsByComponent
}

export interface RpcSuiteListResponse {
  [parentDir: string]: string[]
}

export interface RpcGetSuiteResponse {
  path: string
  configuration: SuiteConfiguration
}

export type RpcSuiteRunScriptResponse = number

export type RpcSuiteProcessesResponse = Array<SuiteProcessDetails>

export type RpcSuiteProcessesDetailsResponse = SuiteProcessDetailsWithOutput

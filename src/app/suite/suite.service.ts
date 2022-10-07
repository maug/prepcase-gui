import { Injectable } from '@angular/core'

import SuiteConfigurationSchema from '../types/schemas/SuiteConfiguration.json'
import { SchemaValidationService } from '../schema-validation.service'
import { JsonRpcService } from '../json-rpc.service'
import {
  RpcExecuteCommandResponse,
  RpcGetSuiteResponse,
  RpcSuiteProcessesDetailsResponse,
  RpcSuiteProcessesResponse,
  RpcSuiteRunScriptResponse,
} from '../types/RpcResponses'
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs'
import { SuiteScriptParams } from '../types/suites'

@Injectable({
  providedIn: 'root',
})
export class SuiteService {
  constructor(private jsonRpcService: JsonRpcService, private schemaValidationService: SchemaValidationService) {}

  getSuite(suiteRoot: string) {
    return new Promise<RpcGetSuiteResponse>((resolve, reject) =>
      this.jsonRpcService
        .rpc<RpcGetSuiteResponse>(environment.jsonRpcUrl, 'App.get_suite', [suiteRoot])
        .subscribe((data) => {
          this.schemaValidationService.validate(SuiteConfigurationSchema, data.configuration)
          resolve(data)
        })
    )
  }

  runScript(suiteRoot: string, scriptPath: string, params: SuiteScriptParams): Observable<RpcSuiteRunScriptResponse> {
    return this.jsonRpcService.rpc(environment.jsonRpcUrl, 'App.run_script_in_suite_with_environment_parameters', [
      suiteRoot,
      scriptPath,
      { environment_parameters: params },
    ])
  }

  listProcesses(suiteRoot: string): Observable<RpcSuiteProcessesResponse> {
    return this.jsonRpcService.rpc(environment.jsonRpcUrl, 'App.show_script_executions_for_suite', [suiteRoot])
  }

  getProcessDetails(suiteRoot: string, pid: number): Observable<RpcSuiteProcessesDetailsResponse> {
    const startLine = 0
    const maxLines = 10
    return this.jsonRpcService.rpc(environment.jsonRpcUrl, 'App.show_script_execution_details_for_suite', [
      suiteRoot,
      pid,
      startLine,
      maxLines,
    ])
  }
}

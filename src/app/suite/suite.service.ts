import { Injectable } from '@angular/core'

import SuiteConfigurationSchema from '../types/schemas/SuiteConfiguration.json'
import { SchemaValidationService } from '../schema-validation.service'
import { JsonRpcService } from '../json-rpc.service'
import { RpcExecuteCommandResponse, RpcGetSuiteResponse } from '../types/RpcResponses'
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

  runScript(suiteRoot: string, scriptPath: string, params: SuiteScriptParams): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpcService.rpc(environment.jsonRpcUrl, 'App.run_script_in_suite_with_environment_parameters', [
      suiteRoot,
      scriptPath,
      params,
    ])
  }
}

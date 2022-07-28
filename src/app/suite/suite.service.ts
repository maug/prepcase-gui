import { Injectable } from '@angular/core'

import SuiteConfigurationSchema from '../types/schemas/SuiteConfiguration.json'
import { SchemaValidationService } from '../schema-validation.service'
import { JsonRpcService } from '../json-rpc.service'
import { RpcGetSuiteResponse } from '../types/RpcResponses'
import { environment } from '../../environments/environment'

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
}

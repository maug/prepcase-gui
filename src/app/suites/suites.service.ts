import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { RpcSuiteListResponse } from '../types/RpcResponses'
import { environment } from '../../environments/environment'
import { JsonRpcService } from '../json-rpc.service'

@Injectable({
  providedIn: 'root',
})
export class SuitesService {
  constructor(private jsonRpcService: JsonRpcService) {}

  getSuiteList(): Observable<RpcSuiteListResponse> {
    return this.jsonRpcService.rpc(environment.jsonRpcUrl, 'App.list_suites', [])
  }
}

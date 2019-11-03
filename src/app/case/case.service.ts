import { Injectable } from '@angular/core';
import { JsonRpcService } from '../json-rpc.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  constructor(private jsonRpc: JsonRpcService) { }

  getCaseData(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlquery', ['--caseroot ' + caseRoot, '--listall']]
    );
  }

  xmlChange(caseRoot, key, value): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlchange', ['--caseroot ' + caseRoot, `${key}=${value}`]]
    );
  }
}

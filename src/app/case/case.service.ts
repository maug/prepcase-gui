import { Injectable } from '@angular/core';
import { JsonRpcService } from '../json-rpc.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  constructor(
    private jsonRpc: JsonRpcService,
  ) { }

  getCaseData(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlquery', ['--listall']]
    );
  }

  xmlChange(caseRoot, key, value): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlchange', [`${key}=${value}`]]
    );
  }

  checkCase(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'check_case', []]
    );
  }

  checkInputData(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'check_input_data', ['--download']]
    );
  }

  caseSetup(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'case.setup', []]
    );
  }

  previewRun(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'preview_run', []]
    );
  }

  caseBuild(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'case.build', []]
    );
  }

  caseSubmit(caseRoot): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'case.submit', []]
    );
  }
}

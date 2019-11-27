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

  loadCaseData(caseRoot: string): Promise<{desc: string, vars: { [key: string]: string }}> {
    return new Promise(resolve => {
      this.xmlQuery(caseRoot, ['--listall']).subscribe(data => {
        const result = {
          desc: data.stdout.trim(),
          vars: {},
        };
        const matches = result.desc.matchAll(/^\s*(.+): (.*)$/mg);
        for (const match of matches) {
          result.vars[match[1]] = match[2];
        }
        resolve(result);
      });
    });
  }

  xmlQuery(caseRoot: string, params: string[] = []): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlquery', params]
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

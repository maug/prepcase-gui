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
    return new Promise((resolve, reject) => {
      this.xmlQuery(caseRoot, ['--listall']).subscribe(data => {
        if (data.return_code !== 0) {
          return reject(data);
        }

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

  runScript(caseRoot: string, script: string, params: string[]): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, script, params]
    );
  }
}

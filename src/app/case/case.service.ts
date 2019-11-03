import { Injectable } from '@angular/core';
import { JsonRpcService } from '../json-rpc.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  constructor(private jsonRpc: JsonRpcService) { }

  getCaseData(caseRoot) {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.run_script_in_case',
      [caseRoot, 'xmlquery', ['--caseroot ' + caseRoot, '--listall']]
    );
  }
}

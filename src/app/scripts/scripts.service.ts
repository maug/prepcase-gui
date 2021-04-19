import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';
import { environment } from '../../environments/environment';
import { JsonRpcService } from '../json-rpc.service';

@Injectable({
  providedIn: 'root'
})
export class ScriptsService {

  constructor(
    private jsonRpcService: JsonRpcService,
  ) { }

  run(script: string): Observable<RpcExecuteCommandResponse>  {
    return this.jsonRpcService.rpc(
      environment.jsonRpcUrl,
      'App.run_user_script',
      [script]
    );
  }

}

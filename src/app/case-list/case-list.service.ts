import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RpcAddNewCasePathResponse, RpcCaseListResponse, RpcExecuteCommandResponse } from '../types/RpcResponses';
import { environment } from '../../environments/environment';
import { JsonRpcService } from '../json-rpc.service';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class CaseListService {

  constructor(
    private userService: UserService,
    private jsonRpcService: JsonRpcService,
  ) { }

  getCaseList(): Observable<RpcCaseListResponse>  {
    return this.jsonRpcService.rpc(
      environment.jsonRpcUrl,
      'App.list_cases',
      [this.userService.userConfig.case_dirs]
    );
  }

  addNewCasePath(path: string): Observable<RpcAddNewCasePathResponse>  {
    return this.jsonRpcService.rpc(
      environment.jsonRpcUrl,
      'App.add_new_case_path',
      [path]
    );
  }

  copyCase(src: string, dst: string): Observable<RpcExecuteCommandResponse>  {
    return this.jsonRpcService.rpc(
      environment.jsonRpcUrl,
      'App.copy_case',
      [src, dst]
    );
  }

}

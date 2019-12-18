import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { JsonRpcService } from './json-rpc.service';
import { UserConfig } from './types/UserConfig';
import { tap } from 'rxjs/operators';
import { RpcCaseListResponse, RpcLoginResponse } from './types/RpcResponses';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userConfig: UserConfig | null = null;

  constructor(
    private jsonRpc: JsonRpcService,
  ) { }

  login(username, password): Observable<RpcLoginResponse> {
    const res = this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.login',
      [username, password]
    ) as Observable<RpcLoginResponse>;

    return res.pipe(
      tap(data => {
        if (data.error_code === '') {
          this.userConfig = data.config;
        }
      }),
    );
  }

  isLogged(): boolean {
    return this.userConfig !== null;
  }

  logout(): void {
    this.userConfig = null;
    this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.logout',
    ).subscribe();
  }

  getCaseList(): Observable<RpcCaseListResponse>  {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.list_cases',
      [this.userConfig.case_dirs]
    );
  }

  addNewCasePath(path): Observable<RpcCaseListResponse>  {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.add_new_case_path',
      [path]
    ).pipe(
      tap(data => this.userConfig.case_dirs = data)
    );
  }
}

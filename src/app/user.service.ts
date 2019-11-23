import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { JsonRpcService } from './json-rpc.service';
import { UserConfig } from './types/UserConfig';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  username: string = '';
  userConfig: UserConfig;

  constructor(
    private jsonRpc: JsonRpcService,
  ) { }

  login(username, password): Observable<RpcLoginResponse> {
    let res = this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.login',
      [username, password]
    ) as Observable<RpcLoginResponse>;

    res = res.pipe(
      tap(data => {
        console.log('TAP', data);
        if (data.error_code === '') {
          this.username = username;
          this.userConfig = this.validateUserConfig(data.config);
        }
      }),
    );

    return res;
  }

  isLogged(): boolean {
    return this.username !== '';
  }

  logout() {
    this.username = '';
    this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.logout',
    );
  }

  getCaseList() {

  }

  private validateUserConfig(config: Partial<UserConfig>): UserConfig {
    if (!config.case_dirs || Array.isArray(config.case_dirs)) {
      config.case_dirs = [];
    }
    return config as UserConfig;
  }
}

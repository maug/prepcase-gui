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
          this.userConfig = this.validateUserConfig(data.config);
        }
      }),
    );
  }

  isLogged(): boolean {
    return this.userConfig !== null;
  }

  logout() {
    this.userConfig = null;
    this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.logout',
    );
  }

  getCaseList() {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.list_cases',
      [this.userConfig.case_dirs]
    );

  }

  private validateUserConfig(config: Partial<UserConfig>): UserConfig {
    if (!config.case_dirs || Array.isArray(config.case_dirs)) {
      config.case_dirs = [];
    }
    return config as UserConfig;
  }
}

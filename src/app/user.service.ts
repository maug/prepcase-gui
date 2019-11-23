import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { JsonRpcService } from './json-rpc.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  username = '';
  userConfig = {};

  constructor(
    private jsonRpc: JsonRpcService,
  ) { }

  login(username, password): Observable<RpcLoginResponse> {
    const res = this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.login',
      [username, password]
    ) as Observable<RpcLoginResponse>;

    res.subscribe(data => {
      if (data.error_code === '') {
        this.username = username;
        this.userConfig = data.config;
      }
    });

    return res;
  }

  isLogged(): boolean {
    return this.username !== '';
  }

  logout() {
    this.username = '';
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';
import { JsonRpcService } from './json-rpc.service';

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {

  private config: {
    host: string,
    options: string,
  };

  constructor(
    private jsonRpc: JsonRpcService,
  ) { }

  getConfig(): Promise<any> {
    if (this.config !== undefined) {
      return Promise.resolve(this.config);
    }

    return new Promise((resolve, reject) => {
      this.jsonRpc.rpc(
        environment.jsonRpcUrl,
        'App.get_server_config',
        []
      ).pipe(
        tap(data => {
            this.config = data;
        }),
      ).subscribe(data => resolve(data));
    });
  }
}

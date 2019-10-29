import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: { code: number, message: string, data?: any };
}

@Injectable({
  providedIn: 'root'
})
export class JsonRpcService {

  // id incremented by each RPC call
  private rpcId = 1;

  constructor(private http: HttpClient) { }

  public rpc(endpoint: string, method: string, params: object = []): Observable<any> {
    const headers = new HttpHeaders({
        'Content-Type':  'text/plain',  // 'application/json' triggers preflight OPTION request which crashes flask_jsonrpc
        'Accept': 'application/json'
    });
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.rpcId++,
      method,
      params,
    };
    return this.http.post(endpoint, JSON.stringify(body), { headers, responseType: 'json' })
      .pipe(
        map(this.getResult),
        catchError(err => { console.error(err); throw new Error(err); }),
      );
  }

  private getResult(res: JsonRpcResponse): any {
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res.result;
  }
}

import { Injectable, Injector, NgZone } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, throwError } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: any
}
interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number
  result?: any
  error?: { code: number; message: string; data?: any }
}

@Injectable({
  providedIn: 'root',
})
export class JsonRpcService {
  // id incremented by each RPC call
  private rpcId = 1

  constructor(private http: HttpClient, private injector: Injector) {}

  public rpc(endpoint: string, method: string, params: object = []): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain', // 'application/json' triggers preflight OPTION request which crashes flask_jsonrpc
      Accept: 'application/json',
    })
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.rpcId++,
      method,
      params,
    }
    return this.http
      .post(endpoint, JSON.stringify(body), { headers, responseType: 'json', withCredentials: true })
      .pipe(
        tap((res: JsonRpcResponse) => {
          if (res.result === '__not_logged__') {
            console.log('NOT LOGGED')
            this.injector.get(Router).navigate(['/login'])
            //throw new Error('User not logged');
          }
        }),
        map(this.getResult),
        catchError((err) => {
          return throwError(err)
        })
      )
  }

  private getResult(res: JsonRpcResponse): any {
    if (res.error) {
      throw new Error(res.error.message)
    }
    return res.result
  }
}

import { xml2js } from 'xml-js';
import { forkJoin, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GridData } from '../types/GridData';
import { JsonRpcService } from '../json-rpc.service';
import { environment } from '../../environments/environment';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';
import { catchError, map } from 'rxjs/operators';

export interface Compset {
  name: string;
  longName: string;
}

export interface CompsetsGroup {
  type: string;
  items: Compset[];
}

@Injectable({
  providedIn: 'root'
})
export class CreateNewcaseService {

  data: {
    compsets: CompsetsGroup[],
    gridData: GridData,
  };

  constructor(private http: HttpClient, private jsonRpc: JsonRpcService) {
  }

  async loadData(): Promise<void> {
    if (this.data) {
      return Promise.resolve();
    }
    this.data = { compsets: null, gridData: null };

    return new Promise<void>((resolve, reject) => {
      forkJoin({
        compsets: this.queryConfig('compsets'),
        grids: this.queryConfig('grids'),
      }).pipe(
        map(data => {
          this.data.compsets = this.parseCompsetsData(data.compsets);
          this.data.gridData = this.parseGridData(data.grids);
        }),
        catchError(err => {
          console.error('ERROR loading compsets or grids', err);
          reject(err.message);
          return of([]);
        }),
      ).subscribe(data => {
        resolve();
      });
    });
  }

  createNewcase(params: string[]): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.run_tool', ['create_newcase', params]);
  }

  private queryConfig(subject: 'compsets' | 'grids'): Observable<string> {
    return (this.jsonRpc.rpc(
      environment.jsonRpcUrl, 'App.run_tool', ['query_config', ['--' + subject, '--xml']]
    ) as Observable<RpcExecuteCommandResponse>).pipe(
      map(res => {
        if (res.return_code !== 0) {
          throw new Error(res.stderr);
        }
        return res.stdout;
      })
    );
  }

  private parseCompsetsData(compsetsXml: string): CompsetsGroup[] {
    const parsed: any = xml2js(compsetsXml, {
      compact: true,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
    });

    // Prop "type" is now empty because there are no descriptions of compset groups anymore
    return Object.values(parsed.data.compsets).map((compsets: any) => ({
      type: '',
      items: compsets.compset.map(compset => ({
        name: compset.alias._text,
        longName: compset.lname._text,
      }))
    }));
  }

  private parseGridData(defsXML: string): GridData {
    const parsed: any = xml2js(defsXML, {
      compact: true,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
    });
    return parsed.grid_data;
  }
}

import { xml2js } from 'xml-js';
import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GridData } from './types/GridData';
import { JsonRpcService } from './json-rpc.service';
import { ToolsParameters } from './types/ToolsParameters';

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
    toolsParameters: ToolsParameters,
    compsets: CompsetsGroup[],
    gridData: GridData,
  };

  constructor(private http: HttpClient, private jsonRpc: JsonRpcService) {
  }

  loadData(): Promise<any> {
    this.data = { toolsParameters: null, compsets: null, gridData: null };

    const allLoaded = new Promise((resolve, reject) => {
      forkJoin({
        toolsParameters: this.jsonRpc.rpc('http://prepcase.test:5000/api', 'App.tools_parameters'),
        compsets: this.http.get('assets/config_compsets.json', {responseType: 'json'}),
        grids: this.http.get('assets/config_grids.xml', {responseType: 'text'}),
      }).subscribe(data => {
        console.log('toolsParameters', data.toolsParameters);
        this.data.toolsParameters = data.toolsParameters;
        this.data.compsets = this.parseCompsetsData(data.compsets);
        this.data.gridData = this.parseGridData(data.grids);
        resolve(true);
      });
    });

    return allLoaded;
  }

  private parseCompsetsData(defs: any): CompsetsGroup[] {
    // map compsets to modified structure
    return defs.compsets.map(typeObject => {
      return {
        type: Object.keys(typeObject)[0],
        items: (Object.values(typeObject)[0] as Array<any>).map(item => ({
          name: item[0],
          longName: item[1],
        }))
      };
    });
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

export function createNewcaseServiceFactory(service: CreateNewcaseService) {
  return () => service.loadData();
}

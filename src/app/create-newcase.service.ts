import { xml2js } from 'xml-js';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GridData } from './models/GridData';

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

  data: { compsets: CompsetsGroup[], gridData: GridData };

  constructor(private http: HttpClient) {
  }

  loadData() {
    this.data = { compsets: null, gridData: null };

    const compsetsPromise = new Promise((resolve, reject) => {
      this.http.get('assets/config_compsets.json', {responseType: 'json'})
        .subscribe(data => {
          this.data.compsets = this.parseCompsetsData(data);
          resolve(true);
        });
    });

    const gridsPromise = new Promise((resolve, reject) => {
      this.http.get('assets/config_grids.xml', {responseType: 'text'})
        .subscribe(data => {
          this.data.gridData = this.parseGridData(data);
          resolve(true);
        });
    });

    return Promise.all([compsetsPromise, gridsPromise]);
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

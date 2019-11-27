import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { JsonRpcService } from './json-rpc.service';
import { Action, ToolParameter, ToolsParameters } from './types/ToolsParameters';

@Injectable({
  providedIn: 'root'
})
export class ToolParametersService {

  private data: ToolsParameters;

  constructor(private http: HttpClient, private jsonRpc: JsonRpcService) {
  }

  async getToolParameters(tool: string): Promise<ToolParameter[]> {
    if (this.data) {
      return Promise.resolve(this.data[tool]);
    }

    return new Promise(resolve => {
      this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.tools_parameters')
        .subscribe(data => {
          this.data = this.parseToolParametersData(data);
          resolve(this.data[tool]);
        });
    });
  }

  private parseToolParametersData(toolParameters: ToolsParameters): ToolsParameters {
    for (const section of Object.values(toolParameters) as Array<ToolParameter[]>) {
      for (const item of section) {
        item.help = item.help.trim();
        if (item.parameter_name === '--help') {
          // convert --help parameter to checkbox
          item.action = Action.StoreTrue;
          item.default = null;
        }
        if (item.help === '==SUPPRESS==') {
          item.help = '';
        }
        if (item.default != null) {
          item.help += '\n\nDefault value: ' + String(item.default);
        }
      }
      // move positional arguments to the end of list
      // (if nargs is set to '?', it is positional argument)
      section.sort((a, b) => (a.nargs === '?' ? 1 : 0) - (b.nargs === '?' ? 1 : 0));
    }
    return toolParameters;
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RpcNamelistsResponse } from '../types/RpcResponses';
import { JsonRpcService } from '../json-rpc.service';

@Injectable({
  providedIn: 'root'
})
export class NamelistsService {

  constructor(
    private jsonRpcService: JsonRpcService,
  ) { }

  getNamelists(): Observable<RpcNamelistsResponse>  {
    return of(staticNamelistResponse);
  }

}

const staticNamelistResponse: RpcNamelistsResponse = {
  error: '',
  namelists: {
    cam: [
      {
        filename: 'cam_filename1',
        parsed: {
          'key_cam1 long long long long long': 'value1_1\nmulti\nline',
          key_cam2: 'value2_1',
          key_cam3: 'value3_1',
        }
      },
      {
        filename: 'cam_filename2',
        parsed: {
          'key_cam1_long_long_long_long_long': 'value1_2 very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long line',
          key_cam2: 'value2_2',
          key_cam3: 'value3_2',
        }
      },
      {
        filename: 'cam_filename3',
        parsed: {
          key_cam1: 'value1_3',
          key_cam2: 'value2_3',
          key_cam3: 'value3_3',
        }
      },
      {
        filename: 'cam_filename4',
        parsed: {
        }
      },
    ],
    cice: [
      {
        filename: 'cice_filename1',
        parsed: {
          key_cice1: 'value1_1',
          key_cice2: 'value2_1',
          key_cice3: 'value3_1',
        }
      },
      {
        filename: 'cice_filename2',
        parsed: {
          key_cice1: 'value1_2',
          key_cice2: 'value2_2',
          key_cice3: 'value3_2',
        }
      },
    ],
  },
};

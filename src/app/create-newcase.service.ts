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

  private unmappedData = JSON.parse(`
{
  "compsets": [
    {
      "allactive": [
        [
          "B1850", 
          "1850_CAM60_CLM50%BGC-CROP_CICE_POP2%ECO_MOSART_CISM2%NOEVOLVE_WW3_BGC%BDRD"
        ], 
        [
          "BW1850", 
          "1850_CAM60%WCTS_CLM50%BGC-CROP_CICE_POP2%ECO%NDEP_MOSART_CISM2%NOEVOLVE_WW3"
        ], 
        [
          "BWma1850", 
          "1850_CAM60%WCCM_CLM50%BGC-CROP_CICE_POP2%ECO_MOSART_CISM2%NOEVOLVE_WW3"
        ], 
        [
          "BHIST", 
          "HIST_CAM60_CLM50%BGC-CROP_CICE_POP2%ECO_MOSART_CISM2%NOEVOLVE_WW3_BGC%BDRD"
        ], 
        [
          "BC5L45BGC", 
          "2000_CAM50_CLM45%BGC_CICE_POP2_MOSART_SGLC_SWAV"
        ], 
        [
          "B1850L45BGCR", 
          "1850_CAM60_CLM45%BGC_CICE_POP2_RTM_SGLC_SWAV"
        ], 
        [
          "B1850C5L45BGC", 
          "1850_CAM50_CLM45%BGC_CICE_POP2_MOSART_SGLC_SWAV"
        ], 
        [
          "BRCP85L45BGCR", 
          "RCP8_CAM60_CLM45%BGC_CICE_POP2_RTM_SGLC_SWAV"
        ], 
        [
          "BRCP85C5L45BGC", 
          "RCP8_CAM50_CLM45%BGC_CICE_POP2_MOSART_SGLC_SWAV"
        ], 
        [
          "BC5L45BGCR", 
          "2000_CAM50_CLM45%BGC_CICE_POP2_RTM_SGLC_SWAV"
        ], 
        [
          "B1850C4L45BGCRBPRP", 
          "1850_CAM40_CLM45%BGC_CICE_POP2%ECO_RTM_SGLC_SWAV_BGC%BPRP"
        ], 
        [
          "B1850C4L45BGCBPRP", 
          "1850_CAM40_CLM45%BGC_CICE_POP2%ECO_MOSART_SGLC_SWAV_BGC%BPRP"
        ], 
        [
          "B1850L45BGCRBPRP", 
          "1850_CAM60_CLM45%BGC_CICE_POP2%ECO_RTM_SGLC_SWAV_BGC%BPRP"
        ], 
        [
          "B1850G", 
          "1850_CAM60_CLM50%BGC-CROP_CICE_POP2%ECO_MOSART_CISM2%EVOLVE_WW3_BGC%BDRD"
        ], 
        [
          "B1850G1", 
          "1850_CAM60_CLM50%BGC-CROP_CICE_POP2%ECO_MOSART_CISM1%EVOLVE_WW3_BGC%BDRD"
        ], 
        [
          "ETEST", 
          "2000_CAM60_CLM50%SP_CICE_DOCN%SOM_MOSART_SGLC_SWAV_TEST"
        ], 
        [
          "E1850L45TEST", 
          "1850_CAM60_CLM45%SP_CICE_DOCN%SOM_MOSART_SGLC_SWAV_TEST"
        ], 
        [
          "J1850G", 
          "1850_DATM%CRU_CLM50%BGC-CROP_CICE_POP2_MOSART_CISM2%EVOLVE_SWAV"
        ]
      ]
    }, 
    {
      "drv": [
        [
          "A", 
          "2000_DATM%NYF_SLND_DICE%SSMI_DOCN%DOM_DROF%NYF_SGLC_SWAV"
        ], 
        [
          "ADSOM", 
          "2000_DATM%NYF_SLND_DICE%SSMI_DOCN%SOM_DROF%NYF_SGLC_SWAV_TEST"
        ], 
        [
          "ADSOMAQP", 
          "2000_DATM%NYF_SLND_SICE_DOCN%SOMAQP_SROF_SGLC_SWAV"
        ], 
        [
          "ADAQP3", 
          "2000_DATM%NYF_SLND_SICE_DOCN%AQP3_SROF_SGLC_SWAV"
        ], 
        [
          "ADAQPFILE", 
          "2000_DATM%NYF_SLND_SICE_DOCN%AQPFILE_SROF_SGLC_SWAV"
        ], 
        [
          "A1850DLND", 
          "1850_SATM_DLND%SCPL_SICE_SOCN_SROF_SGLC_SWAV"
        ], 
        [
          "ADWAV", 
          "2000_SATM_SLND_SICE_SOCN_SROF_SGLC_DWAV%CLIMO"
        ], 
        [
          "ADESP", 
          "2000_DATM%NYF_SLND_SICE_DOCN%SOMAQP_SROF_SGLC_SWAV_DESP%NOOP"
        ], 
        [
          "ADESP_TEST", 
          "2000_DATM%NYF_SLND_SICE_DOCN%SOMAQP_SROF_SGLC_SWAV_DESP%TEST"
        ], 
        [
          "AIAF", 
          "2000_DATM%IAF_SLND_DICE%IAF_DOCN%IAF_DROF%IAF_SGLC_SWAV"
        ], 
        [
          "S", 
          "2000_SATM_SLND_SICE_SOCN_SROF_SGLC_SWAV_SESP"
        ], 
        [
          "X", 
          "2000_XATM_XLND_XICE_XOCN_XROF_XGLC_XWAV"
        ]
      ]
    }, 
    {
      "clm": [
        [
          "I1PtClm50SpGs", 
          "2000_DATM%1PT_CLM50%SP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I1PtClm45SpGs", 
          "2000_DATM%1PT_CLM45%SP_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "I2000Clm50Sp", 
          "2000_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50BgcCru", 
          "2000_DATM%CRUv7_CLM50%BGC_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50BgcCropRtm", 
          "2000_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50BgcCrop", 
          "2000_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50Cn", 
          "2000_DATM%GSWP3v1_CLM50%CN_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50Sp", 
          "1850_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50SpCru", 
          "1850_DATM%CRUv7_CLM50%SP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50BgcCrop", 
          "1850_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50BgcCropCmip6", 
          "1850_DATM%GSWP3v1_CLM50%BGC-CROP-CMIP6DECK_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50BgcCropCmip6waccm", 
          "1850_DATM%GSWP3v1_CLM50%BGC-CROP-CMIP6WACCMDECK_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50BgcCropCru", 
          "1850_DATM%CRUv7_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50SpGs", 
          "2000_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50BgcCropGs", 
          "2000_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50BgcCropQianGs", 
          "2000_DATM%QIA_CLM50%BGC-CROP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50BgcCropQianRsGs", 
          "2000_DATM%QIA_CLM50%BGC-CROP_SICE_SOCN_SROF_SGLC_SWAV"
        ], 
        [
          "I2000Clm50BgcCruGs", 
          "2000_DATM%CRUv7_CLM50%BGC_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50SpRtmFl", 
          "2000_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_RTM%FLOOD_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50Fates", 
          "2000_DATM%GSWP3v1_CLM50%FATES_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50FatesCruGs", 
          "2000_DATM%CRUv7_CLM50%FATES_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50FatesGs", 
          "2000_DATM%GSWP3v1_CLM50%FATES_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I1850Clm50Bgc", 
          "1850_DATM%GSWP3v1_CLM50%BGC_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm50BgcCrop", 
          "HIST_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm50Sp", 
          "HIST_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm50Bgc", 
          "HIST_DATM%GSWP3v1_CLM50%BGC_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm50BgcQianGs", 
          "HIST_DATM%QIA_CLM50%BGC_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "IHistClm50BgcCropGs", 
          "HIST_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "IHistClm50BgcCropQianGs", 
          "HIST_DATM%QIA_CLM50%BGC-CROP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Clm50BgcDvCrop", 
          "2000_DATM%GSWP3v1_CLM50%BGCDV-CROP_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm50BgcDvCropQianGs", 
          "2000_DATM%QIA_CLM50%BGCDV-CROP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I1850Clm50BgcSpinup", 
          "1850_DATM%CPLHIST_CLM50%BGC_SICE_SOCN_MOSART_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Ctsm50NwpSpGswpGs", 
          "2000_DATM%GSWP3v1_CLM50%NWP-SP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Ctsm50NwpSpNldasGs", 
          "2000_DATM%NLDAS2_CLM50%NWP-SP_SICE_SOCN_MOSART_SGLC_SWAV"
        ], 
        [
          "I2000Ctsm50NwpSpNldasRsGs", 
          "2000_DATM%NLDAS2_CLM50%NWP-SP_SICE_SOCN_SROF_SGLC_SWAV"
        ], 
        [
          "I1850Clm45BgcCrop", 
          "1850_DATM%GSWP3v1_CLM45%BGC-CROP_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm45BgcCruGs", 
          "1850_DATM%CRUv7_CLM45%BGC_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "IHistClm45BgcCrop", 
          "HIST_DATM%GSWP3v1_CLM45%BGC-CROP_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm45BgcCropQianGs", 
          "HIST_DATM%QIA_CLM45%BGC-CROP_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "I2000Clm45Sp", 
          "2000_DATM%GSWP3v1_CLM45%SP_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm45BgcCrop", 
          "2000_DATM%GSWP3v1_CLM45%BGC-CROP_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm45Fates", 
          "2000_DATM%GSWP3v1_CLM45%FATES_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm45FatesGs", 
          "2000_DATM%GSWP3v1_CLM45%FATES_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "I1850Clm45Cn", 
          "1850_DATM%GSWP3v1_CLM45%CN_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm45Bgc", 
          "1850_DATM%GSWP3v1_CLM45%BGC_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm45BgcGs", 
          "1850_DATM%GSWP3v1_CLM45%BGC_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "I1850Clm45BgcCru", 
          "1850_DATM%CRUv7_CLM45%BGC_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm45Bgc", 
          "HIST_DATM%GSWP3v1_CLM45%BGC_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "IHistClm45BgcGs", 
          "HIST_DATM%GSWP3v1_CLM45%BGC_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "IHistClm45BgcCruGs", 
          "HIST_DATM%CRUv7_CLM45%BGC_SICE_SOCN_RTM_SGLC_SWAV"
        ], 
        [
          "I2000Clm50Vic", 
          "2000_DATM%GSWP3v1_CLM50%SP-VIC_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I2000Clm45VicCru", 
          "2000_DATM%CRUv7_CLM45%SP-VIC_SICE_SOCN_RTM_CISM2%NOEVOLVE_SWAV"
        ], 
        [
          "I1850Clm50SpG", 
          "1850_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_CISM2%EVOLVE_SWAV"
        ], 
        [
          "IHistClm50SpG", 
          "HIST_DATM%GSWP3v1_CLM50%SP_SICE_SOCN_MOSART_CISM2%EVOLVE_SWAV"
        ], 
        [
          "I1850Clm50BgcCropG", 
          "1850_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%EVOLVE_SWAV"
        ], 
        [
          "IHistClm50BgcCropG", 
          "HIST_DATM%GSWP3v1_CLM50%BGC-CROP_SICE_SOCN_MOSART_CISM2%EVOLVE_SWAV"
        ]
      ]
    }
  ]
}
  `);

  constructor(private http: HttpClient) {
  }

  loadData() {
    this.data = { compsets: null, gridData: null };
    // map compsets to modified structure
    this.data.compsets = this.unmappedData.compsets.map(typeObject => {
      return {
        type: Object.keys(typeObject)[0],
        items: (Object.values(typeObject)[0] as Array<any>).map(item => ({
          name: item[0],
          longName: item[1],
        }))
      };
    });

    return new Promise((resolve, reject) => {
      this.http.get('assets/config_grids.xml', {responseType: 'text'})
        .subscribe(data => {
          this.data.gridData = this.parseGridData(data);
          resolve(true);
        });
    });
  }

  private parseGridData(defsXML: string): GridData {
    const parsed: any = xml2js(defsXML, {
      compact: true,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
    });
    console.log('GRIDS', parsed);
    return parsed.grid_data;
  }
}

export function createNewcaseServiceFactory(service: CreateNewcaseService) {
  return () => service.loadData();
}

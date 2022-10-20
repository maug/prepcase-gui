import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { RpcCaseListResponse, RpcNamelistsResponse } from '../types/RpcResponses'
import { JsonRpcService } from '../json-rpc.service'
import { environment } from '../../environments/environment'
import { NamelistsByComponent } from '../types/namelists'

@Injectable({
  providedIn: 'root',
})
export class NamelistsService {
  constructor(private jsonRpc: JsonRpcService) {}

  getCaseList(casesRoot: string): Observable<RpcCaseListResponse> {
    return this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.list_cases', [[casesRoot]])
  }

  getNamelists(caseRoot: string): Observable<RpcNamelistsResponse> {
    return this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.get_namelists', [caseRoot])
  }

  updateNamelists(caseRoot, namelists: NamelistsByComponent): Observable<RpcNamelistsResponse> {
    return this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.update_namelists', [caseRoot, namelists])
  }

  getNamelistDefinitionLink(component: string): string | null {
    switch (component) {
      case 'cam': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/cam_nml.html'
      }
      case 'cice': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/cice_nml.html'
      }
      case 'cism': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/cism_nml.html'
      }
      case 'clm': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/clm5_0_nml.html'
      }
      case 'datm': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/datm_nml.html'
      }
      case 'desp': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/desp_nml.html'
      }
      case 'dice': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/dice_nml.html'
      }
      case 'dnld': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/dlnd_nml.html'
      }
      case 'docn': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/docn_nml.html'
      }
      case 'drof': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/drof_nml.html'
      }
      case 'dwav': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/dwav_nml.html'
      }
      case 'marbl': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/marbl_nml.html'
      }
      case 'mosart': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/mosart_nml.html'
      }
      case 'pop2': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/pop2_nml.html'
      }
      case 'rtm': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/rtm_nml.html'
      }
      case 'ww3': {
        return 'https://www.cesm.ucar.edu/models/cesm2/settings/current/ww3_nml.html'
      }
      default:
        return null
    }
  }
}

const staticNamelistResponse: RpcNamelistsResponse = {
  namelists: {
    cam: [
      {
        filename: 'sample_namelists/user_nl_cam_0002',
        parsed: {
          empty_htapes: ['.true.'],
          ext_frc_cycle_yr: ['2010'],
          ext_frc_specifier: [
            "'H2O -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/elev/H2OemissionCH4oxidationx2_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_a2_so4_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'SO2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
          ],
          ext_frc_type: ["'CYCLICAL'"],
          fincl1: ["'PHIS:I'", "'T:I'", "'U:I'", "'V:I'", "'Q:I'", "'PS:I'", "'PSL:I'"],
          flbc_file: ["'/work/csp/cmip03/Forcing/SetLBCdate/LBC_1750-2020_CMIP6_GlobAnnAvg_c180926.nc'"],
          flbc_fixed_ymd: ['20100702'],
          flbc_type: ["'FIXED'"],
          inithist: ["'ENDOFRUN'"],
          mfilt: ['1'],
          ncdata: ["'/work/csp/pk21219/CESM2/dart_startup_2017/run/dart_startup_2017.cam_0002.i.2017-01-15-00000.nc'"],
          nhtfrq: ['-6'],
          prescribed_ozone_cycle_yr: ['2010'],
          prescribed_ozone_type: ["'CYCLICAL'"],
          prescribed_strataero_cycle_yr: ['2010'],
          prescribed_strataero_type: ["'CYCLICAL'"],
          solar_irrad_data_file: [
            "'/data/inputs/CESM/inputdata/atm/cam/solar/SolarForcingCMIP6_18491230-22991231_c171031.nc'",
          ],
          srf_emis_cycle_yr: ['2010'],
          srf_emis_specifier: [
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_other_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170509.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ag-ship-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ene_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_biogenic_surface_1750-2015_0.9x1.25_c20170322.nc'",
          ],
          srf_emis_type: ["'CYCLICAL'"],
          tracer_cnst_cycle_yr: ['2010'],
          tracer_cnst_datapath: ["'/data/inputs/CESM/inputdata/atm/cam/tracer_cnst'"],
          tracer_cnst_file: ["'tracer_cnst_halons_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'"],
          tracer_cnst_type: ["'CYCLICAL'"],
        },
      },
      {
        filename: 'sample_namelists/user_nl_cam_0001',
        parsed: {
          empty_htapes: ['.true.'],
          ext_frc_cycle_yr: ['2010'],
          ext_frc_specifier: [
            "'H2O -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/elev/H2OemissionCH4oxidationx2_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_a2_so4_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'SO2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
          ],
          ext_frc_type: ["'CYCLICAL'"],
          fincl1: ["'PHIS:I'", "'T:I'", "'U:I'", "'V:I'", "'Q:I'", "'PS:I'", "'PSL:I'"],
          flbc_file: ["'/work/csp/cmip03/Forcing/SetLBCdate/LBC_1750-2020_CMIP6_GlobAnnAvg_c180926.nc'"],
          flbc_fixed_ymd: ['20100702'],
          flbc_type: ["'FIXED'"],
          inithist: ["'ENDOFRUN'"],
          mfilt: ['1'],
          ncdata: ["'/work/csp/pk21219/CESM2/dart_startup_2017/run/dart_startup_2017.cam_0001.i.2017-01-15-00000.nc'"],
          nhtfrq: ['-6'],
          prescribed_ozone_cycle_yr: ['2010'],
          prescribed_ozone_type: ["'CYCLICAL'"],
          prescribed_strataero_cycle_yr: ['2010'],
          prescribed_strataero_type: ["'CYCLICAL'"],
          solar_irrad_data_file: [
            "'/data/inputs/CESM/inputdata/atm/cam/solar/SolarForcingCMIP6_18491230-22991231_c171031.nc'",
          ],
          srf_emis_cycle_yr: ['2010'],
          srf_emis_specifier: [
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_other_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170509.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ag-ship-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ene_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_biogenic_surface_1750-2015_0.9x1.25_c20170322.nc'",
          ],
          srf_emis_type: ["'CYCLICAL'"],
          tracer_cnst_cycle_yr: ['2010'],
          tracer_cnst_datapath: ["'/data/inputs/CESM/inputdata/atm/cam/tracer_cnst'"],
          tracer_cnst_file: ["'tracer_cnst_halons_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'"],
          tracer_cnst_type: ["'CYCLICAL'"],
        },
      },
      {
        filename: 'sample_namelists/user_nl_cam_0003',
        parsed: {
          empty_htapes: ['.true.'],
          ext_frc_cycle_yr: ['2010'],
          ext_frc_specifier: [
            "'H2O -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/elev/H2OemissionCH4oxidationx2_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_a2_so4_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'SO2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ene_vertical_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_contvolcano_vertical_850-5000_0.9x1.25_c20170724.nc'",
          ],
          ext_frc_type: ["'CYCLICAL'"],
          fincl1: ["'PHIS:I'", "'T:I'", "'U:I'", "'V:I'", "'Q:I'", "'PS:I'", "'PSL:I'"],
          flbc_file: ["'/work/csp/cmip03/Forcing/SetLBCdate/LBC_1750-2020_CMIP6_GlobAnnAvg_c180926.nc'"],
          flbc_fixed_ymd: ['20100702'],
          flbc_type: ["'FIXED'"],
          inithist: ["'ENDOFRUN'"],
          mfilt: ['1'],
          ncdata: ["'/work/csp/pk21219/CESM2/dart_startup_2017/run/dart_startup_2017.cam_0003.i.2017-01-15-00000.nc'"],
          nhtfrq: ['-6'],
          prescribed_ozone_cycle_yr: ['2010'],
          prescribed_ozone_type: ["'CYCLICAL'"],
          prescribed_strataero_cycle_yr: ['2010'],
          prescribed_strataero_type: ["'CYCLICAL'"],
          solar_irrad_data_file: [
            "'/data/inputs/CESM/inputdata/atm/cam/solar/SolarForcingCMIP6_18491230-22991231_c171031.nc'",
          ],
          srf_emis_cycle_yr: ['2010'],
          srf_emis_specifier: [
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'bc_a4 ->  /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'DMS ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_DMS_other_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_bc_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'num_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_num_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170509.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'pom_a4 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_pom_a4_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ag-ship-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_anthro-ene_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SO2 ->    /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SO2_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_anthro-ag-ship_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'so4_a1 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a1_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'so4_a2 -> /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_so4_a2_anthro-res_surface_1750-2015_0.9x1.25_c20170616.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_anthro_surface_1750-2015_0.9x1.25_c20170608.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_bb_surface_1750-2015_0.9x1.25_c20170322.nc'",
            "'SOAG ->   /data/inputs/CESM/inputdata/atm/cam/chem/emis/CMIP6_emissions_1750_2015/emissions-cmip6_SOAGx1.5_biogenic_surface_1750-2015_0.9x1.25_c20170322.nc'",
          ],
          srf_emis_type: ["'CYCLICAL'"],
          tracer_cnst_cycle_yr: ['2010'],
          tracer_cnst_datapath: ["'/data/inputs/CESM/inputdata/atm/cam/tracer_cnst'"],
          tracer_cnst_file: ["'tracer_cnst_halons_3D_L70_1849-2015_CMIP6ensAvg_c180927.nc'"],
          tracer_cnst_type: ["'CYCLICAL'"],
        },
      },
    ],
    cice: [
      {
        filename: 'sample_namelists/user_nl_cice_0002',
        parsed: {
          ice_ic: ["'dart_startup_2017.cice_0002.r.2017-01-15-00000.nc'"],
        },
      },
      {
        filename: 'sample_namelists/user_nl_cice_0003',
        parsed: {
          ice_ic: ["'dart_startup_2017.cice_0003.r.2017-01-15-00000.nc'"],
        },
      },
      {
        filename: 'sample_namelists/user_nl_cice_0001',
        parsed: {
          ice_ic: ["'dart_startup_2017.cice_0001.r.2017-01-15-00000.nc'"],
        },
      },
    ],
    clm: [
      {
        filename: 'sample_namelists/user_nl_clm_0002',
        parsed: {
          hist_avgflag_pertape: ["'I'"],
          hist_empty_htapes: ['.true.'],
          hist_fincl1: ["'TSA'"],
          hist_mfilt: ['1'],
          hist_nhtfrq: ['-6'],
          use_lch4: ['.false.'],
        },
      },
      {
        filename: 'sample_namelists/user_nl_clm_0003',
        parsed: {
          hist_avgflag_pertape: ["'I'"],
          hist_empty_htapes: ['.true.'],
          hist_fincl1: ["'TSA'"],
          hist_mfilt: ['1'],
          hist_nhtfrq: ['-6'],
          use_lch4: ['.false.'],
        },
      },
      {
        filename: 'sample_namelists/user_nl_clm_0001',
        parsed: {
          hist_avgflag_pertape: ["'I'"],
          hist_empty_htapes: ['.true.'],
          hist_fincl1: ["'TSA'"],
          hist_mfilt: ['1'],
          hist_nhtfrq: ['-6'],
          use_lch4: ['.false.'],
        },
      },
    ],
    cpl: [
      {
        filename: 'sample_namelists/user_nl_cpl',
        parsed: {},
      },
    ],
    docn: [
      {
        filename: 'sample_namelists/user_nl_docn_0002',
        parsed: {},
      },
      {
        filename: 'sample_namelists/user_nl_docn_0003',
        parsed: {},
      },
      {
        filename: 'sample_namelists/user_nl_docn_0001',
        parsed: {},
      },
    ],
    mosart: [
      {
        filename: 'sample_namelists/user_nl_mosart_0001',
        parsed: {},
      },
      {
        filename: 'sample_namelists/user_nl_mosart_0002',
        parsed: {},
      },
      {
        filename: 'sample_namelists/user_nl_mosart_0003',
        parsed: {},
      },
    ],
  },
}

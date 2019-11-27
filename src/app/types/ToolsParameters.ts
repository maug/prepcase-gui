export interface ToolsParameters {
  'case.build': ToolParameters[];
  'case.cmpgen_namelists': ToolParameters[];
  'case.qstatus': ToolParameters[];
  'case.setup': ToolParameters[];
  'case.submit': ToolParameters[];
  'case_diff': ToolParameters[];
  'check_case': ToolParameters[];
  'check_input_data': ToolParameters[];
  'check_lockedfiles': ToolParameters[];
  'code_checker': ToolParameters[];
  'compare_namelists': ToolParameters[];
  'component_compare_baseline': ToolParameters[];
  'component_compare_copy': ToolParameters[];
  'component_compare_test': ToolParameters[];
  'component_generate_baseline': ToolParameters[];
  'create_clone': ToolParameters[];
  'create_newcase': ToolParameters[];
  'create_test': ToolParameters[];
  'e3sm_check_env': ToolParameters[];
  'e3sm_cime_merge': ToolParameters[];
  'e3sm_cime_split': ToolParameters[];
  'generate_cylc_workflow.py': ToolParameters[];
  'getTiming': ToolParameters[];
  'jenkins_generic_job': ToolParameters[];
  'list_e3sm_tests': ToolParameters[];
  'normalize_cases': ToolParameters[];
  'pelayout': ToolParameters[];
  'preview_namelists': ToolParameters[];
  'preview_run': ToolParameters[];
  'query_config': ToolParameters[];
  'query_testlists': ToolParameters[];
  'save_provenance': ToolParameters[];
  'simple_compare': ToolParameters[];
  'wait_for_tests': ToolParameters[];
  'xmlchange': ToolParameters[];
  'xmlquery': ToolParameters[];
}

export interface ToolParameters {
  action?: Action;
  choices?: string[];
  default?: boolean | number | null | string;
  dest?: string;
  help: string;
  metavar?: string;
  nargs?: string;
  parameter_name: string;
  required?: boolean;
  type?: string;
}

export enum Action {
  Append = 'append',
  Help = 'help',
  StoreTrue = 'store_true',
}

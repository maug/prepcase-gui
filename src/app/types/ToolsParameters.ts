export interface ToolsParameters {
  'case.build': ToolParameter[];
  'case.cmpgen_namelists': ToolParameter[];
  'case.qstatus': ToolParameter[];
  'case.setup': ToolParameter[];
  'case.submit': ToolParameter[];
  'case_diff': ToolParameter[];
  'check_case': ToolParameter[];
  'check_input_data': ToolParameter[];
  'check_lockedfiles': ToolParameter[];
  'code_checker': ToolParameter[];
  'compare_namelists': ToolParameter[];
  'component_compare_baseline': ToolParameter[];
  'component_compare_copy': ToolParameter[];
  'component_compare_test': ToolParameter[];
  'component_generate_baseline': ToolParameter[];
  'create_clone': ToolParameter[];
  'create_newcase': ToolParameter[];
  'create_test': ToolParameter[];
  'e3sm_check_env': ToolParameter[];
  'e3sm_cime_merge': ToolParameter[];
  'e3sm_cime_split': ToolParameter[];
  'generate_cylc_workflow.py': ToolParameter[];
  'getTiming': ToolParameter[];
  'jenkins_generic_job': ToolParameter[];
  'list_e3sm_tests': ToolParameter[];
  'normalize_cases': ToolParameter[];
  'pelayout': ToolParameter[];
  'preview_namelists': ToolParameter[];
  'preview_run': ToolParameter[];
  'query_config': ToolParameter[];
  'query_testlists': ToolParameter[];
  'save_provenance': ToolParameter[];
  'simple_compare': ToolParameter[];
  'wait_for_tests': ToolParameter[];
  'xmlchange': ToolParameter[];
  'xmlquery': ToolParameter[];
}

export interface ToolParameter {
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

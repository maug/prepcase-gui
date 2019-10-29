export interface ToolsParameters {
  create_clone: CreateClone[];
  create_newcase: CreateNewcase[];
  create_test: CreateTest[];
  query_config: QueryConfig[];
  query_testlists: QueryTestlist[];
}

export interface CreateClone {
  action?: Action;
  default?: number | string;
  help: string;
  parameter_name: string;
  required?: boolean;
}

export enum Action {
  Append = 'append',
  Help = 'help',
  StoreTrue = 'store_true',
}

export interface CreateNewcase {
  action?: Action;
  default?: number | null | string;
  help: string;
  parameter_name: string;
  metavar?: string;
  required?: boolean;
  dest?: string;
  choices?: string[];
}

export interface CreateTest {
  action?: Action;
  default?: boolean | number | null | string;
  help: string;
  parameter_name: string;
  nargs?: string;
  type?: string;
}

export interface QueryConfig {
  action?: Action;
  default?: string;
  help: string;
  parameter_name: string;
  choices?: string[];
  const?: string;
  nargs?: string;
}

export interface QueryTestlist {
  action?: Action;
  default?: string;
  help: string;
  parameter_name: string;
  choices?: string[];
  dest?: string;
}

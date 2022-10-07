interface SuiteConfiguration {
  scripts: SuiteScriptConfiguration[]
}

interface SuiteScriptConfiguration {
  path: string
  environment_parameters: EnvironmentParameter[]
}

type SuiteScriptParams = Array<{ name: string; value: string }>

interface EnvironmentParameter {
  name: string
  label: string
  description?: string
  type: 'string' | 'select'
  default?: string
  required?: boolean
  options?: Array<OptionClass | string>
}

interface OptionClass {
  value: string
  label: string
}

interface SuiteProcessDetails {
  current_time: number
  exit_code: number | string
  parameters: SuiteScriptParams
  pid: number
  script_path: string
  start_time: 0
  status: string
}

interface SuiteProcessDetailsWithOutput extends SuiteProcessDetails {
  output_lines: any
}

export {
  EnvironmentParameter,
  SuiteConfiguration,
  SuiteScriptConfiguration,
  SuiteScriptParams,
  SuiteProcessDetails,
  SuiteProcessDetailsWithOutput,
}

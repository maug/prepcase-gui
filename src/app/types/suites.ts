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

export { EnvironmentParameter, SuiteConfiguration, SuiteScriptConfiguration, SuiteScriptParams }

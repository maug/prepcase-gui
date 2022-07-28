interface SuiteConfiguration {
  scripts: Script[]
}

interface Script {
  path: string
  environment_parameters: EnvironmentParameter[]
}

interface EnvironmentParameter {
  name: string
  label: string
  description?: string
  type: 'string' | 'select'
  default: string
  options?: Array<OptionClass | string>
}

interface OptionClass {
  value: string
  label: string
}

export { SuiteConfiguration }

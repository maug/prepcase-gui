export type NamelistVarValue = string[]

export interface Namelist {
  filename: string
  parsed: {
    [key: string]: NamelistVarValue
  }
}

export interface NamelistsByComponent {
  [component: string]: Namelist[]
}

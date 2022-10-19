export type NamelistVarValue = string[]

export interface Namelist {
  caseRoot?: string // only for multi-case edit
  filename: string
  parsed: {
    [key: string]: NamelistVarValue
  }
}

export interface NamelistsByComponent {
  [component: string]: Namelist[]
}

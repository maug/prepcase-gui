import { FormItemBaseConfig } from './FormItemBaseConfig'

export interface FormItemDropdownConfig extends FormItemBaseConfig<string> {
  options: { key: string | symbol; value: string }[]
  multiple: boolean
}

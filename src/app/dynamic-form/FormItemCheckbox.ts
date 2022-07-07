import { FormItemBase } from './FormItemBase'
import { FormItemBaseConfig } from './FormItemBaseConfig'

export class FormItemCheckbox extends FormItemBase<boolean> {
  controlType = 'checkbox'

  constructor(options: FormItemBaseConfig<boolean>) {
    super(options)
  }
}

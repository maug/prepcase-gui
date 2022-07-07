import { FormItemBase } from './FormItemBase'
import { FormItemDropdownConfig } from './FormItemDropdownConfig'

export class FormItemDropdown extends FormItemBase<string> {
  controlType = 'dropdown'
  options: { key: string | symbol; value: string }[] = []
  multiple: boolean = false

  constructor(config: FormItemDropdownConfig) {
    super(config)
    this.options = config.options
    this.multiple = config.multiple
  }
}

import { FormItemBase } from './FormItemBase';
import { FormItemDropdownConfig } from './FormItemDropdownConfig';

export class FormItemDropdown extends FormItemBase<string> {
  controlType = 'dropdown';
  options: { key: string, value: string }[] = [];

  constructor(config: FormItemDropdownConfig) {
    super(config);
    this.options = config.options;
  }
}

import { FormItemBase } from './FormItemBase';
import { FormItemTextConfig } from './FormItemTextConfig';

export class FormItemText extends FormItemBase<string> {
  controlType = 'text';
  type: string;

  constructor(options: FormItemTextConfig) {
    super(options);
    this.type = options.type;
  }
}

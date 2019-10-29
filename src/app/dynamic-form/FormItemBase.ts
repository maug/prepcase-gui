import { FormItemBaseConfig } from './FormItemBaseConfig';

export class FormItemBase<T> {
  controlType: string;
  help?: string;
  key: string;
  label: string;
  order: number;
  required: boolean;
  value: T;

  constructor(config: FormItemBaseConfig<T>) {
    this.controlType = config.controlType || '';
    this.help = config.help || '';
    this.key = config.key || '';
    this.label = config.label || '';
    this.order = config.order === undefined ? 1 : config.order;
    this.required = !!config.required;
    this.value = config.value;
  }
}

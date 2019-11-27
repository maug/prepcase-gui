import { Injectable } from '@angular/core';
import { FormItemBase } from './FormItemBase';
import { Action, ToolParameter } from '../types/ToolsParameters';
import { FormItemCheckbox } from './FormItemCheckbox';
import { FormItemDropdown } from './FormItemDropdown';
import { FormItemText } from './FormItemText';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor() { }

  createInputs(formParams: ToolParameter[], skipParams: string[] = [], form?: FormGroup): FormItemBase<any>[] {
    const inputs: FormItemBase<any>[] = [];
    for (const entry of formParams) {
      if (skipParams.includes(entry.parameter_name)) {
        // skip parameter
        continue;
      }
      // mytodo: required item
      // mytodo: validations
      let input: FormItemBase<any>;
      if (entry.action === Action.StoreTrue) {
        input = new FormItemCheckbox({
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          value: !!entry.default,
        });
      } else if (entry.choices) {
        input = new FormItemDropdown({
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          options: entry.choices.map(o => ({ key: o, value: o })),
          value: entry.default ? String(entry.default) : '',
        });
      } else {
        input = new FormItemText({
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          type: 'text',
          value: '',
        });
      }
      inputs.push(input);
      if (form) {
        form.addControl(input.key, new FormControl(input.value));
      }
    }
    return inputs;
  }

  readInputs(formParams: ToolParameter[], form: FormGroup) {
    const params = formParams.map(item => {
      const control = form.get(item.parameter_name);
      if (!control) {
        return null;
      } else if (!control.value) {
        return null;
      } else if (control.value === true) {
        return item.parameter_name;
      } else if (item.nargs === '?') {
        // positional argument
        return `${control.value}`;
      } else {
        return `${item.parameter_name} ${control.value}`;
      }
    }).filter(Boolean);
    return params;
  }
}

import { Injectable } from '@angular/core'
import { FormItemBase } from './FormItemBase'
import { Action, ToolParameter } from '../types/ToolsParameters'
import { FormItemCheckbox } from './FormItemCheckbox'
import { FormItemDropdown } from './FormItemDropdown'
import { FormItemText } from './FormItemText'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { FormItemDropdownConfig } from './FormItemDropdownConfig'
import { pairwise, startWith } from 'rxjs/operators'

const noOptionsSymbol = Symbol('no_options')

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  constructor() {}

  createInputs(formParams: ToolParameter[], skipParams: string[] = [], form?: UntypedFormGroup): FormItemBase<any>[] {
    const inputs: FormItemBase<any>[] = []
    for (const entry of formParams) {
      if (skipParams.includes(entry.parameter_name)) {
        // skip parameter
        continue
      }
      // mytodo: required item
      // mytodo: validations
      let input: FormItemBase<any>
      if (entry.action === Action.StoreTrue) {
        input = new FormItemCheckbox({
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          value: !!entry.default,
        })
      } else if (entry.choices) {
        const config: FormItemDropdownConfig = {
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          value: entry.default ? String(entry.default) : '',
          options: entry.choices.map((o) => ({ key: o, value: o })),
          multiple: ['*', '+'].includes(entry.nargs),
        }
        if (config.multiple) {
          if (entry.nargs === '*') {
            // zero or more options
            config.options.unshift({ key: noOptionsSymbol, value: '== without options ==' })
          }
        } else {
          config.options.unshift({ key: null, value: 'None' })
        }
        input = new FormItemDropdown(config)
      } else {
        input = new FormItemText({
          help: entry.help,
          key: entry.parameter_name,
          label: entry.parameter_name,
          type: 'text',
          value: '',
        })
      }
      inputs.push(input)
      if (form) {
        let value: string | string[] = input.value
        if (input instanceof FormItemDropdown && input.multiple) {
          // multiselect - convert to array
          value = input.value.split(',').filter(Boolean)
        }
        form.addControl(input.key, new UntypedFormControl(value))

        // add reactive listener to mutually exclude noOptionsSymbol and other options
        if (input instanceof FormItemDropdown && input.multiple) {
          const formInput = form.get(input.key)
          formInput.valueChanges.pipe(startWith(value), pairwise()).subscribe(([oldValues, newValues]) => {
            if (newValues.length > oldValues.length) {
              const newValue = newValues.filter((x) => !oldValues.includes(x))[0]
              if (newValue === noOptionsSymbol) {
                // deselect other options
                formInput.setValue([noOptionsSymbol])
              } else {
                // deselect no-options
                formInput.setValue(newValues.filter((x) => x !== noOptionsSymbol))
              }
            }
          })
        }
      }
    }
    return inputs
  }

  readInputs(formParams: ToolParameter[], form: UntypedFormGroup) {
    return formParams
      .map((item) => {
        const control = form.get(item.parameter_name)
        if (!control) {
          return null
        } else if (!control.value) {
          return null
        } else if (control.value === true) {
          // simple switch (checkbox)
          return item.parameter_name
        } else if (item.nargs === '?') {
          // positional unnamed argument (text)
          return `${control.value}`
        } else if (['*', '+'].includes(item.nargs)) {
          // named multiselect argument (array)
          if (control.value.length === 0) {
            return null
          } else {
            return `${item.parameter_name} ${control.value.filter((v) => v !== noOptionsSymbol).join(' ')}`.trim()
          }
        } else {
          // named argument (text)
          return `${item.parameter_name} ${control.value}`
        }
      })
      .filter(Boolean)
  }
}

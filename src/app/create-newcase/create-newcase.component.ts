import { Component, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from '../create-newcase.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

import { ModelGrid } from '../types/GridData';
import { FormItemText } from '../dynamic-form/FormItemText';
import { FormItemBase } from '../dynamic-form/FormItemBase';
import { Action } from '../types/ToolsParameters';
import { FormItemCheckbox } from '../dynamic-form/FormItemCheckbox';
import { FormItemDropdown } from '../dynamic-form/FormItemDropdown';

@Component({
  selector: 'app-create-newcase',
  templateUrl: './create-newcase.component.html',
  styleUrls: ['./create-newcase.component.scss']
})
export class CreateNewcaseComponent implements OnInit {

  compsetGroups: CompsetsGroup[] = this.dataService.data.compsets;
  compsetsGroupsOptions: Observable<CompsetsGroup[]>;

  grids: ModelGrid[] = this.dataService.data.gridData.grids.model_grid;
  gridOptions: Observable<ModelGrid[]>;

  mainForm: FormGroup;

  dynamicInputs: FormItemBase<any>[] = [];

  gridErrorMatcher = new FormErrorStateMatcher('gridIncompatible');

  constructor(
    private dataService: CreateNewcaseService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.createFormControls();

    this.compsetsGroupsOptions = this.mainForm.get('--compset').valueChanges
      .pipe(
        startWith(''),
        // why after selection here goes object (although diplayFn changed it to longName)?
        // map(value => typeof value === 'string' ? value : value.longName),
        map((value: string) => this.filterCompsetsGroups(value))
      );
    this.gridOptions = this.mainForm.valueChanges
      .pipe(
        startWith(''),
        map((value: { [key: string]: string }) => this.filterGrids(value['--res'] || ''))
      );
  }

  onSubmit() {
    console.warn('SUBMIT!', this.mainForm.value);

    const params = this.dataService.data.toolsParameters.create_newcase.map(item => {
      const control = this.mainForm.get(item.parameter_name);
      if (!control) {
        return null;
      } else {
        if (!control.value) {
          return null;
        } else {
          if (control.value === true) {
            return item.parameter_name;
          } else {
            return `${item.parameter_name} ${control.value}`;
          }
        }
      }
    }).filter(Boolean);

    // const submittedCommand = 'create_newcase\n' + params.reduce((param, acc) => `${param}  ${acc}\n`, '');
    // this.snackBar.open(submittedCommand, null, {
    //   duration: 10000,
    // });

    this.dialog.open(HelpDialogComponent, {
      disableClose: true,
      data: {
        texts: 'Please wait...',
      }
    });
    this.dataService.createNewcase(params).subscribe(data => {
      console.log('CREATE_NEWCASE', data);
      const texts = [
        { text: 'COMMAND', classes: 'h1' },
        { text: data.command, classes: 'formatted' },
      ];
      if (data.return_code !== 0) {
        texts.push({ text: 'RETURN CODE: ' + data.return_code, classes: 'h1 error' });
      }
      if (data.stderr) {
        texts.push({ text: 'STDERR', classes: 'h1 error' });
        texts.push({ text: data.stderr, classes: 'formatted error' });
      }
      if (data.stdout) {
        texts.push({ text: 'STDOUT', classes: 'h1' });
        texts.push({ text: data.stdout, classes: 'formatted' });
      }
      this.dialog.closeAll();
      this.dialog.open(HelpDialogComponent, {
        data: {
          header: 'CREATE_NEWCASE',
          texts,
        }
      });

    });
  }

  openHelp(keyOrFormItem: string | FormItemBase<any>) {
    const key: string = typeof keyOrFormItem === 'string' ? keyOrFormItem : keyOrFormItem.key;
    const item = this.dataService.data.toolsParameters.create_newcase.find(row => row.parameter_name === key);
    const texts: any[] = [item.help];
    if (key === '--res') {
      texts.push({ text: '<p>Each grid alias can be associated with two attributes:</p>' +
        '      <ul>' +
        '        <li><span style="color: green">Regular expression for compset matches that are required for this grid</span></li>' +
        '        <li><span style="color: red">Regular expression for compset matches that are not permitted this grid</span></li>' +
        '      </ul>', keepHtml: true });
    }
    this.dialog.open(HelpDialogComponent, {
      data: {
        header: key,
        texts,
      }
    });
  }

  private createFormControls(): void {
    this.mainForm = this.formBuilder.group({
      '--case': ['/home/vagrant/case_test_name_mynior', [Validators.required, this.caseNameValidator()]],
      '--compset': ['X', [Validators.required, this.compsetValidator()]],
      '--res': ['f19_g16', [Validators.required, this.gridValidator()]],
      // ninst: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    }, { validators: this.compsetGridValidator() });

    for (const entry of this.dataService.data.toolsParameters.create_newcase) {
      if (this.mainForm.get(entry.parameter_name)) {
        // skip parameters defined manually
        continue;
      }
      if (entry.parameter_name === '--help') {
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
      } else  if (entry.choices) {
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
          value: entry.default == null ? '' : String(entry.default),
        });
      }
      this.dynamicInputs.push(input);
      this.mainForm.addControl(input.key, new FormControl(input.value));
    }
  }

  // --- case name

  private caseNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.toString().match(/\s/) ? { hasWhitespace: true } : null;
    };
  }

  // --- compset

  private filterCompsetsGroups(value: string): CompsetsGroup[] {
    if (value) {
      return this.compsetGroups
        .map(group => ({ type: group.type, items: this.filterCompsets(group.items, value) }))
        .filter(group => group.items.length > 0);
    } else {
      return this.compsetGroups;
    }
  }

  private filterCompsets(opt: Compset[], value: string): Compset[] {
    const filterValue = value.trim().toLowerCase();

    return opt.filter(item =>
      item.longName.toLowerCase().indexOf(filterValue) !== -1
      || item.name.toLowerCase().indexOf(filterValue) !== -1
    );
  }

  private compsetValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compsets = this.compsetGroups.flatMap(group => group.items);
      return compsets.find(compset => compset.name === control.value) ? null : { compsetInvalid: true };
    };
  }

  // --- grid

  private filterGrids(value: string): ModelGrid[] {
    value = value.trim().toLowerCase();
    return this.grids
      .filter(grid => grid._attributes.alias.toLowerCase().indexOf(value) !== -1)
      .filter(grid => {
        const ctrlCompset: AbstractControl = this.mainForm.get('--compset');
        if (!ctrlCompset || ctrlCompset.errors) {
          return true;
        } else {
          const compset = this.compsetGroups.flatMap(group => group.items).find(c => c.name === ctrlCompset.value);
          return this.checkCompsetGridCompatibility(compset, grid) === null;
        }
      });
  }

  private gridValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.grids.find(grid => grid._attributes.alias === control.value) ? null : { gridInvalid: true };
    };
  }

  // --- form validators

  private compsetGridValidator(): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      const ctrlCompset: AbstractControl = control.get('--compset');
      const ctrlGrid: AbstractControl = control.get('--grid');
      if (!ctrlCompset || !ctrlGrid || ctrlCompset.errors || ctrlGrid.errors) {
        return null;
      }
      const compset = this.compsetGroups.flatMap(group => group.items).find(c => c.name === ctrlCompset.value);
      const grid = this.grids.find(g => g._attributes.alias === ctrlGrid.value);
      return this.checkCompsetGridCompatibility(compset, grid);
    };
  }

  private checkCompsetGridCompatibility(compset: Compset, grid: ModelGrid): null | { gridIncompatible: string } {
    if (grid._attributes.compset) {
      if (compset.longName.match(new RegExp(grid._attributes.compset)) === null) {
        return { gridIncompatible: `Grid requires compset "${grid._attributes.compset}"` };
      }
    }
    if (grid._attributes.not_compset) {
      if (compset.longName.match(new RegExp(grid._attributes.not_compset)) !== null) {
        return { gridIncompatible: `Grid is incompatible with compset "${grid._attributes.not_compset}"` };
      }
    }
    return null;
  }
}

class FormErrorStateMatcher implements ErrorStateMatcher {

  constructor(private formError: string) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && (control.invalid || form.hasError(this.formError));
  }
}

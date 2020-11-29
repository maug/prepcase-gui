import { Component, isDevMode, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from './create-newcase.service';
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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

import { ModelGrid } from '../types/GridData';
import { FormItemBase } from '../dynamic-form/FormItemBase';
import { ToolParameter } from '../types/ToolsParameters';
import { Router } from '@angular/router';
import { ToolParametersService } from '../tool-parameters.service';
import { DynamicFormService } from '../dynamic-form/dynamic-form.service';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';

@Component({
  selector: 'app-create-newcase',
  templateUrl: './create-newcase.component.html',
  styleUrls: ['./create-newcase.component.scss']
})
export class CreateNewcaseComponent implements OnInit {

  isLoaded = false;

  compsetGroups: CompsetsGroup[];
  compsetsGroupsOptions: Observable<CompsetsGroup[]>;

  grids: ModelGrid[];
  gridOptions: Observable<ModelGrid[]>;

  mainForm: FormGroup;

  dynamicInputs: FormItemBase<any>[] = [];

  gridErrorMatcher = new FormErrorStateMatcher('gridIncompatible');

  private createNewcaseParameters: ToolParameter[];

  constructor(
    private router: Router,
    private dataService: CreateNewcaseService,
    private toolParametersService: ToolParametersService,
    private dynamicFormService: DynamicFormService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    try {
      await this.dataService.loadData();
    } catch (error) {
      this.dialog.open(HelpDialogComponent, {
        disableClose: true,
        data: {
          header: 'LOADING DATA ERROR',
          texts: [error],
        }
      });
      return; // fatal crash, stop app
    }
    this.compsetGroups = this.dataService.data.compsets;
    this.grids = this.dataService.data.gridData.grids.model_grid;
    this.createNewcaseParameters = await this.toolParametersService.getToolParameters('create_newcase');

    this.createFormControls();

    this.compsetsGroupsOptions = this.mainForm.get('--compset').valueChanges
      .pipe(
        startWith(''),
        map((value: string) => this.filterCompsetsGroups(value))
      );
    this.gridOptions = this.mainForm.valueChanges
      .pipe(
        startWith(''),
        map((value: { [key: string]: string }) => this.filterGrids(value['--res'] || ''))
      );

    this.isLoaded = true;
  }

  onSubmit() {
    console.warn('SUBMIT!', this.mainForm.value);

    const params = this.createNewcaseParameters.map(item => {
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

    this.pleaseWaitService.show();
    this.dataService.createNewcase(params).subscribe(data => {
      console.log('CREATE_NEWCASE', data);
      const buttons = [];
      const texts = [
        { text: 'COMMAND', classes: 'h1' },
        { text: data.command, classes: 'pre-wrap monospace' },
      ];
      if (data.return_code !== 0) {
        texts.push({ text: 'RETURN CODE: ' + data.return_code, classes: 'h1 error' });
      }
      if (data.stderr) {
        texts.push({ text: 'STDERR', classes: 'h1 error' });
        texts.push({ text: data.stderr, classes: 'pre-wrap monospace error' });
      }
      if (data.stdout) {
        texts.push({ text: 'STDOUT', classes: 'h1' });
        texts.push({ text: data.stdout, classes: 'pre-wrap monospace' });
      }

      let caseRoot: string;
      if (data.return_code === 0) {
        const match = data.stdout.match(/Creating Case directory (.+)$/m);
        if (match) {
          caseRoot = match[1];
          texts.push({ text: `New case was created in "${caseRoot}"`, classes: 'h1' });
          buttons.push({ label: 'Go to case', id: 'go_to_case' });
        }
      }
      this.pleaseWaitService.hide();
      const dialogRef = this.dialog.open(HelpDialogComponent, {
        data: {
          header: 'CREATE_NEWCASE',
          texts,
          buttons,
        }
      });

      dialogRef.afterClosed().subscribe(buttonId => {
        if (caseRoot && buttonId === 'go_to_case') {
          this.router.navigate(['/case', caseRoot]);
        }
      });

    });
  }

  openHelp(keyOrFormItem: string | FormItemBase<any>) {
    const key: string = typeof keyOrFormItem === 'string' ? keyOrFormItem : keyOrFormItem.key;
    const item = this.createNewcaseParameters.find(row => row.parameter_name === key);
    const texts: any[] = [{ text: item.help, classes: 'pre-wrap' }];
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
      '--case': ['', [Validators.required, this.caseNameValidator()]],
      '--compset': ['', [Validators.required, this.compsetValidator()]],
      '--res': ['', [Validators.required, this.gridValidator()]],
      // ninst: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    }, { validators: this.compsetGridValidator() });

    this.dynamicInputs = this.dynamicFormService.createInputs(
      this.createNewcaseParameters,
      Object.keys(this.mainForm.controls).concat(['--help']),
      this.mainForm
    );

    if (isDevMode()) {
      this.mainForm.get('--case').setValue('/home/vagrant/case_mynior');
      this.mainForm.get('--compset').setValue('X');
      this.mainForm.get('--res').setValue('f19_g16');
      this.mainForm.get('--machine').setValue('centos7-linux');
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
      // allow any value in compset (for unsupported compsets
      return null;
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
          if (!compset) {
            // unsupported compset, do not check grid compatibility
            return true;
          }
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
      const ctrlGrid: AbstractControl = control.get('--res');
      if (!ctrlCompset || !ctrlGrid || ctrlCompset.errors || ctrlGrid.errors) {
        return null;
      }
      const compset = this.compsetGroups.flatMap(group => group.items).find(c => c.name === ctrlCompset.value);
      if (!compset) {
        // unsupported compset, do not check grid compatibility
        return null;
      }
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

import { Component, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from '../create-newcase.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective, NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';

import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

import { ModelGrid } from '../models/GridData';

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

  mainForm: FormGroup = this.formBuilder.group({
    case: ['', [Validators.required, this.caseNameValidator()]],
    compset: ['', [Validators.required, this.compsetValidator()]],
    grid: ['', [Validators.required, this.gridValidator()]],
    ninst: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    'multi-driver': [false],
  }, { validators: this.compsetGridValidator() });

  gridErrorMatcher = new FormErrorStateMatcher('gridIncompatible');

  constructor(
    private dataService: CreateNewcaseService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.compsetsGroupsOptions = this.mainForm.get('compset').valueChanges
      .pipe(
        startWith(''),
        // why after selection here goes object (although diplayFn changed it to longName)?
        // map(value => typeof value === 'string' ? value : value.longName),
        map((value: string) => this.filterCompsetsGroups(value))
      );
    this.gridOptions = this.mainForm.get('grid').valueChanges
      .pipe(
        startWith(''),
        map((value: string) => this.filterGrids(value))
      );
  }

  onSubmit() {
    console.warn('SUBMIT!', this.mainForm.value);
    const submittedCommand = `
      create_newcase
        --case=${this.mainForm.get('case').value}
        --compset=${this.mainForm.get('compset').value}
        --res=${this.mainForm.get('grid').value}
        ${this.mainForm.get('ninst').value ? '--ninst=' + this.mainForm.get('ninst').value : ''}
        ${this.mainForm.get('multi-driver').value ? '--multi-driver' : ''}
    `.trimRight().replace(/^\s*\n/gm, '');
    this.snackBar.open(submittedCommand, null, {
      duration: 10000,
    });
  }

  openDialog(command) {
    this.dialog.open(HelpDialogComponent, {
      data: {
        command
      }
    });
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
    if (value) {
      value = value.trim().toLowerCase();
      return this.grids
        .filter(grid => grid._attributes.alias.toLowerCase().indexOf(value) !== -1);
    } else {
      return this.grids;
    }
  }

  private gridValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.grids.find(grid => grid._attributes.alias === control.value) ? null : { gridInvalid: true };
    };
  }

  // --- form validators

  private compsetGridValidator(): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      const ctrlCompset: AbstractControl = control.get('compset');
      const ctrlGrid: AbstractControl = control.get('grid');
      if (!ctrlCompset || !ctrlGrid || ctrlCompset.errors || ctrlGrid.errors) {
        return null;
      }
      const compset = this.compsetGroups.flatMap(group => group.items).find(c => c.name === ctrlCompset.value);
      const grid = this.grids.find(g => g._attributes.alias === ctrlGrid.value);
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
    };
  }
}

class FormErrorStateMatcher implements ErrorStateMatcher {

  constructor(private formError: string) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && (control.invalid || form.hasError(this.formError));
  }
}

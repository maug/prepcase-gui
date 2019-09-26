import { Component, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from '../create-newcase.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';

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

  grid: ModelGrid[] = this.dataService.data.gridData.grids.model_grid;
  gridOptions: Observable<ModelGrid[]>;

  mainForm: FormGroup = this.formBuilder.group({
    case: ['', [Validators.required]],
    compset: ['', [Validators.required, this.compsetValidator()]],
    grid: ['', [Validators.required]],
    ninst: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    'multi-driver': [false],
  });

  submittedCommand: string = '';

  constructor(private dataService: CreateNewcaseService, private formBuilder: FormBuilder, private dialog: MatDialog) {
  }

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
    this.submittedCommand = `
      create_newcase
        --case=${this.mainForm.get('case').value}
        --compset=${this.mainForm.get('compset').value}
        ${this.mainForm.get('ninst').value ? '--ninst=' + this.mainForm.get('ninst').value : ''}
        ${this.mainForm.get('multi-driver').value ? '--multi-driver' : ''}
    `;
  }

  openDialog(command) {
    this.dialog.open(HelpDialogComponent, {
      data: {
        command
      }
    });
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
    return (control: AbstractControl): {[key: string]: any} | null => {
      const compsets = this.compsetGroups.flatMap(group => group.items);
      return compsets.find(compset => compset.name === control.value) ? null : { compsetInvalid: true };
    };
  }

  // --- grid

  private filterGrids(value: string): ModelGrid[] {
    if (value) {
      value = value.trim().toLowerCase();
      return this.grid
        .filter(grid => grid._attributes.alias.toLowerCase().indexOf(value) !== -1);
    } else {
      return this.grid;
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from '../create-newcase.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';

import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

@Component({
  selector: 'app-create-newcase',
  templateUrl: './create-newcase.component.html',
  styleUrls: ['./create-newcase.component.scss']
})
export class CreateNewcaseComponent implements OnInit {

  compsetGroups: CompsetsGroup[] = this.dataService.data.compsets;
  compsetsGroupsOptions: Observable<CompsetsGroup[]>;

  mainForm: FormGroup = this.formBuilder.group({
    case: ['', [Validators.required]],
    compset: ['', [Validators.required, this.compsetValidator()]],
    ninst: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    'multi-driver': [false],
  });

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
  }

  onSubmit() {
    console.warn('SUBMIT!', this.mainForm.value);
  }

  private openDialog(command) {
    this.dialog.open(HelpDialogComponent, {
      data: {
        command
      }
    });
  }

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

  compsetValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const compsets = this.compsetGroups.flatMap(group => group.items);
      return compsets.find(compset => compset.name === control.value) ? null : { compsetInvalid: true };
    };
  }

}

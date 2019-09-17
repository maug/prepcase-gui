import { Component, OnInit } from '@angular/core';
import { Compset, CompsetsGroup, CreateNewcaseService } from "../create-newcase.service";
import { FormBuilder, FormGroup } from "@angular/forms";

import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';

@Component({
  selector: 'app-create-newcase',
  templateUrl: './create-newcase.component.html',
  styleUrls: ['./create-newcase.component.scss']
})
export class CreateNewcaseComponent implements OnInit {

  mainForm: FormGroup = this.formBuilder.group({
    compset: '', // initial value
  });
  readonly compsetGroups: CompsetsGroup[];

  compsetsGroupsOptions: Observable<CompsetsGroup[]>;

  constructor(private dataService: CreateNewcaseService, private formBuilder: FormBuilder) {
    this.compsetGroups = dataService.data.compsets;
  }

  ngOnInit() {
    this.compsetsGroupsOptions = this.mainForm.get('compset')!.valueChanges
      .pipe(
        startWith(''),
        // why after selection here goes object (although diplayFn changed it to longName)?
        // map(value => typeof value === 'string' ? value : value.longName),
        map((value: string) => this.filterCompsetsGroups(value))
      );
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
  };

}

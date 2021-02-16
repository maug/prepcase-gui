import { Component, OnInit, ViewChild } from '@angular/core';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NamelistsService } from './namelists.service';
import { NamelistsByComponent, NamelistVarValue } from '../types/namelists';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Var {
  key: string;
  value: NamelistVarValue;
}

@Component({
  selector: 'app-namelists',
  templateUrl: './namelists.component.html',
  styleUrls: ['./namelists.component.scss']
})
export class NamelistsComponent implements OnInit {
  isLoaded = false;
  caseRoot: string;
  defs: {[component: string]: any} = {};
  namelists: NamelistsByComponent;
  areNamelistsChanged = false;
  forms: { [component: string]: FormGroup } = {};
  isFormValid: { [component: string]: boolean } = {};
  fileVars: { [component: string]: Var[] } = {};
  currentFiles: { [component: string]: string } = {};
  displayedColumns = ['key', 'value'];
  readonly varInputKey = '___var$';
  readonly valueInputKey = '___value$';
  readonly window = window;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private namelistsService: NamelistsService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      this.caseRoot = paramMap.get('caseRoot');
      this.namelistsService.getNamelists(this.caseRoot)
        .pipe(
          catchError(error => of({ error, namelists: {} }))
        )
        .subscribe(data => {
          if (data.error) {
            this.displayError(data.error);
            return;
          }

          this.namelists = data.namelists;

          for (const [component, entries] of Object.entries(this.namelists)) {
            const inputs = {
              [this.varInputKey]: '',
              [this.valueInputKey]: '',
            };
            entries.forEach(namelist => inputs[namelist.filename] = false);
            this.forms[component] = this.formBuilder.group(inputs);
          }

          this.onChanges();

          this.isLoaded = true;
        });
    });
  }

  onChanges(): void {
    this.getComponents().forEach(component => this.forms[component].valueChanges
      .subscribe(val => {
        const keys = this.getKeysForComponent(component);
        const anyFileSelected = keys.map(key => this.forms[component].controls[key].value).includes(true);
        const varSelected = !!this.forms[component].controls[this.varInputKey].value.trim();
        const valueSelected = !!this.forms[component].controls[this.valueInputKey].value.trim();
        this.isFormValid[component] = anyFileSelected && varSelected && valueSelected;
      })
    );
  }

  getComponents(): string[] {
    return Object.keys(this.namelists);
  }

  onShowFile(component: string, filename: string) {
    const vars = this.namelists[component].find(entry => entry.filename === filename).parsed;
    this.fileVars[component] = Object.entries(vars)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key));
    this.currentFiles[component] = filename;
  }

  getVar(component: string, row: Var) {
    this.forms[component].get(this.varInputKey).setValue(row.key);
    this.forms[component].get(this.valueInputKey).setValue(row.value.join('\n'));
  }

  setVar(component: string) {
    const key = this.forms[component].get(this.varInputKey).value.trim();
    const value = this.forms[component].get(this.valueInputKey).value.trim();
    const selected = this.getKeysForComponent(component).filter(file => this.forms[component].controls[file].value);

    selected.forEach(filename =>
      this.namelists[component]
        .filter(entry => entry.filename === filename)
        .forEach(entry => entry.parsed[key] = value.split('\n'))
    );

    if (this.currentFiles[component]) {
      this.onShowFile(component, this.currentFiles[component]);
    }

    this.snackBar.open(`Variable "${key}" set`, '', { duration: 2000 });

    this.areNamelistsChanged = true;
  }

  onSelectAll(component: string) {
    const keys = this.getKeysForComponent(component);
    const allSelected = keys.map(key => this.forms[component].controls[key].value).every(Boolean);
    keys.forEach(key => this.forms[component].controls[key].setValue(!allSelected));
  }

  saveNamelists() {
    this.pleaseWaitService.show();
    this.namelistsService.updateNamelists(this.caseRoot, this.namelists)
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe(data => {
        if (data.error) {
          this.displayError(data.error);
        } else {
          this.snackBar.open(`Namelists updated`, '', { duration: 2000 });
        }
        this.pleaseWaitService.hide();
      });
  }

  private getKeysForComponent(component: string): string[] {
    return Object.keys(this.forms[component].controls).filter(key => !this.isInternalInputKey(key));
  }

  private isInternalInputKey(key: string): boolean {
    return key === this.varInputKey || key === this.valueInputKey;
  }

  private displayError(err: string) {
    this.dialog.open(HelpDialogComponent, { data: { header: 'ERROR', texts: [{ text: err, classes: 'pre-wrap monospace error' }], } });
  }
}

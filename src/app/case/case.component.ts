import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from './case.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { MatDialog } from '@angular/material';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss']
})
export class CaseComponent implements OnInit {

  caseRoot: string;

  caseData: string;
  caseVars: { [key: string]: string } = {};
  caseVarsOptions: Observable<string[]>;

  mainForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: CaseService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.caseRoot = paramMap.get('caseRoot');
      this.loadCaseData();
    });

    this.mainForm = this.formBuilder.group({
      'xmlchange_key': ['', [this.varNameValidator()]],
      'xmlchange_value': ['', []],
    });

    // options from autocomplete
    this.caseVarsOptions = this.mainForm.get('xmlchange_key').valueChanges
      .pipe(
        startWith(''),
        map((value: string) => Object.keys(this.caseVars).sort()
          .filter(key => key.toLowerCase().includes(value.toLowerCase()))
        )
      );

    // fill var value when value selected
    this.mainForm.get('xmlchange_key').valueChanges.subscribe(key => {
      if (this.caseVars.hasOwnProperty(key)) {
        this.mainForm.get('xmlchange_value').setValue(this.caseVars[key]);
      }
    });
  }

  onSubmit() {
    this.dialog.open(HelpDialogComponent, {
      disableClose: true,
      data: {
        texts: 'Please wait...',
      }
    });
    this.dataService.xmlChange(
      this.caseRoot,
      this.mainForm.get('xmlchange_key').value,
      this.mainForm.get('xmlchange_value').value
    ).subscribe(data => {
      this.dialog.closeAll();
      if (data.return_code !== 0) {
        this.dialog.open(HelpDialogComponent, {
          data: {
            texts: [{ text: data.stderr, classes: 'error' }],
          }
        });
      } else {
        this.loadCaseData();
      }
    });
  }

  runCommand(cmd: string) {
    switch (cmd) {
      case 'check_case': {
        this.processCommand('Check case', this.dataService.checkCase(this.caseRoot));
        break;
      }
      case 'check_input_data': {
        this.processCommand('Check input data (download)', this.dataService.checkInputData(this.caseRoot));
        break;
      }
      case 'case_setup': {
        this.processCommand('Case setup', this.dataService.caseSetup(this.caseRoot));
        break;
      }
      case 'preview_run': {
        this.processCommand('Preview run', this.dataService.previewRun(this.caseRoot));
        break;
      }
      case 'case_build': {
        this.processCommand('Case setup', this.dataService.caseBuild(this.caseRoot));
        break;
      }
      case 'case_submit': {
        this.processCommand('Case submit', this.dataService.caseSubmit(this.caseRoot));
        break;
      }
      default: throw new Error('Unknown command ' + cmd);
    }
  }

  private processCommand(name: string, cmd$: Observable<RpcExecuteCommandResponse>) {
    this.dialog.open(HelpDialogComponent, {
      disableClose: true,
      data: {
        texts: 'Please wait...',
      }
    });
    cmd$.subscribe(data => {
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
      this.dialog.closeAll();
      this.dialog.open(HelpDialogComponent, {
        data: {
          header: name,
          texts,
        }
      });
    });
  }

  private loadCaseData() {
    this.dataService.getCaseData(this.caseRoot).subscribe(data => {
      this.caseData = data.stdout.trim();
      const matches = this.caseData.matchAll(/^\s*(.+): (.*)$/mg);
      this.caseVars = {};
      for (const match of matches) {
        this.caseVars[match[1]] = match[2];
      }
    });
  }

  private varNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Object.keys(this.caseVars).find(key => key === control.value) ? null : { invalidCaseVar: true };
    };
  }

}

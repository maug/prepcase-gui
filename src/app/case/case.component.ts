import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from './case.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { MatDialog } from '@angular/material';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';
import { ToolParametersService } from '../tool-parameters.service';
import { ScriptParametersDialogComponent } from '../script-parameters-dialog/script-parameters-dialog.component';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss']
})
export class CaseComponent implements OnInit {

  public isLoaded = false;

  caseRoot: string;

  caseDescription: string;
  caseVars: { [key: string]: string } = {};
  caseVarsOptions: Observable<string[]>;

  mainForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: CaseService,
    private toolParametersService: ToolParametersService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      this.caseRoot = paramMap.get('caseRoot');
      ({ desc: this.caseDescription, vars: this.caseVars } = await this.dataService.loadCaseData(this.caseRoot));
      this.isLoaded = true;
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
    this.pleaseWaitService.show();
    this.dataService.xmlChange(
      this.caseRoot,
      this.mainForm.get('xmlchange_key').value,
      this.mainForm.get('xmlchange_value').value
    ).subscribe(async data => {
      if (data.return_code !== 0) {
        this.pleaseWaitService.hide();
        this.dialog.open(HelpDialogComponent, {
          data: {
            texts: [{ text: data.stderr, classes: 'error' }],
          }
        });
      } else {
        ({ desc: this.caseDescription, vars: this.caseVars } = await this.dataService.loadCaseData(this.caseRoot));
        this.pleaseWaitService.hide();
      }
    });
  }

  async runCommand(cmd: string) {
    const scriptParams = await this.toolParametersService.getToolParameters(cmd);
    const dialogRef = this.dialog.open(ScriptParametersDialogComponent, {
      disableClose: true,
      minWidth: 600,
      data: {
        header: cmd,
        scriptParams,
      }
    });
    dialogRef.afterClosed().subscribe((result: string[] | false) => {
      console.log('dialog closed', cmd, result);
      if (result) {
        this.processCommand(cmd, this.dataService.runScript(this.caseRoot, cmd, result));
      }
    });
  }

  private processCommand(name: string, cmd$: Observable<RpcExecuteCommandResponse>) {
    this.pleaseWaitService.show();
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
      this.pleaseWaitService.hide();
      this.dialog.open(HelpDialogComponent, {
        data: {
          header: name,
          texts,
        }
      });
    });
  }

  private varNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Object.keys(this.caseVars).find(key => key === control.value) ? null : { invalidCaseVar: true };
    };
  }

}

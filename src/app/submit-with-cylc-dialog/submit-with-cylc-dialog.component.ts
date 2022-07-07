import { Component, Inject, OnInit } from '@angular/core'
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

interface DialogData {
  caseRoot: string
  DATA_ASSIMILATION_CYCLES: string
  JOB_WALLCLOCK_TIME: string
}

@Component({
  selector: 'app-submit-with-cylc-dialog',
  templateUrl: './submit-with-cylc-dialog.component.html',
  styleUrls: ['./submit-with-cylc-dialog.component.scss'],
})
export class SubmitWithCylcDialogComponent implements OnInit {
  mainForm: UntypedFormGroup

  private casePath: string
  private caseName: string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private selfRef: MatDialogRef<SubmitWithCylcDialogComponent>,
    private formBuilder: UntypedFormBuilder
  ) {
    // trim trailing slash
    this.casePath = this.data.caseRoot.replace(/\/$/, '')
    // get last component of the path
    this.caseName = this.casePath.match(/[^/]+$/)[0]
  }

  ngOnInit() {
    this.mainForm = this.formBuilder.group({
      suitePath: [this.generateSuitePath(), [Validators.required, this.suitePathValidator()]],
      suiteContents: [this.generateSuiteContents(), [Validators.required]],
    })
  }

  onSubmit() {
    const params = {
      suitePath: this.mainForm.get('suitePath').value,
      suiteContents: this.mainForm.get('suiteContents').value,
    }
    console.log('SUBMIT', params)
    this.selfRef.close(params)
  }

  onCancel() {
    this.selfRef.close(false)
  }

  private generateSuitePath(): string {
    const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '')
    return `suites/${this.caseName}_${dateStr}`
  }

  private generateSuiteContents(): string {
    const suite = `
[meta]
  title = CYLC suite for case ${this.caseName}
[cylc]
  [[parameters]]
    member = 1

[scheduling]
  cycling mode = integer
  initial cycle point = 1
  final cycle point = ${this.data.DATA_ASSIMILATION_CYCLES}

  [[dependencies]]
    [[[R1]]]
      graph = "set_external_workflow<member> => run<member> => st_archive<member>"
    [[[R/P1]]] # Integer Cycling
      graph = """
             st_archive<member>[-P1] => run<member>
             run<member> => st_archive<member>
             """
[runtime]
  [[set_external_workflow<member>]]
    script = cd ${this.casePath}; \\
             ./xmlchange EXTERNAL_WORKFLOW=TRUE; \\
             cp env_batch.xml LockedFiles;
    [[[remote]]]
      host = zeus03
  [[st_archive<member>]]
    script = cd ${this.casePath}; \\
             ./case.submit --job case.st_archive; \\
             ./xmlchange CONTINUE_RUN=TRUE
    [[[remote]]]
      host = zeus03

  [[run<member>]]
    script = cd ${this.casePath}; ./case.submit
    [[[remote]]]
      host = zeus03
    [[[job]]]
      batch system = lsf
    [[[directives]]]
      -J=run.${this.caseName}
      -n=324
      -W=${this.data.JOB_WALLCLOCK_TIME}
      -o=cesm.stdout.%J
      -e=cesm.stderr.%J
      -R="span[ptile=36]"
      -q=p_short
      -P=R000
`.trim()
    return suite
  }

  private suitePathValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.toString().match(/^[a-zA-Z0-9\/._\-~]*$/)
        ? null
        : { invalidName: 'Path can contain only letters, numbers, dots, slashes, underscores, dashes and tilde (~)' }
    }
  }
}

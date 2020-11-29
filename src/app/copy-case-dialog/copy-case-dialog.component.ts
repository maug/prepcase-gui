import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-copy-case-dialog',
  templateUrl: './copy-case-dialog.component.html',
  styles: [],
})
export class CopyCaseDialogComponent implements OnInit {
  public mainForm: FormGroup;
  public readonly PATH_KEY = 'newPath';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { fullPath: string, dirName: string },
    public dialogRef: MatDialogRef<CopyCaseDialogComponent>,
    private formBuilder: FormBuilder,
  ) {
    console.log('DATA', data);
    this.mainForm = this.formBuilder.group({
      [this.PATH_KEY]: ['', [Validators.required, this.caseNameValidator()]],
    });
    this.mainForm.get(this.PATH_KEY).setValue(data.dirName + '_' + (new Date()).toISOString().slice(0, 10));
    this.mainForm.get(this.PATH_KEY).markAsTouched();
  }

  ngOnInit() {
  }

  onSubmit() {
    this.close({ ...this.data, ...this.mainForm.value });
  }

  close(result = null) {
    this.dialogRef.close(result);
  }

  private caseNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.toString().match(/^[a-zA-Z0-9\/._\-~]*$/)
        ? null
        : { invalidName: 'Path can contain only letters, numbers, dots, slashes, underscores, dashes and tilde (~)' };
    };
  }

}

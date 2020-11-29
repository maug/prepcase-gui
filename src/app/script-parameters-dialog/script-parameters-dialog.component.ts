import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToolParameter } from '../types/ToolsParameters';
import { FormItemBase } from '../dynamic-form/FormItemBase';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicFormService } from '../dynamic-form/dynamic-form.service';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

interface DialogData {
  header: string;
  scriptParams: ToolParameter[];
}

@Component({
  selector: 'app-script-parameters-dialog',
  templateUrl: './script-parameters-dialog.component.html',
  styleUrls: ['./script-parameters-dialog.component.scss']
})
export class ScriptParametersDialogComponent implements OnInit {

  mainForm: FormGroup;
  dynamicInputs: FormItemBase<any>[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private selfRef: MatDialogRef<ScriptParametersDialogComponent>,
    private dialog: MatDialog,
    private dynamicFormService: DynamicFormService,
    private formBuilder: FormBuilder,
  ) {
  }
  ngOnInit() {
    this.mainForm = this.formBuilder.group({}, {});
    this.dynamicInputs = this.dynamicFormService.createInputs(
      this.data.scriptParams,
      [],
      this.mainForm
    );

  }

  onRun() {
    const params = this.dynamicFormService.readInputs(this.data.scriptParams, this.mainForm);
    this.selfRef.close(params);
  }

  onCancel() {
    this.selfRef.close(false);
  }

  openHelp(item: FormItemBase<any>) {
    this.dialog.open(HelpDialogComponent, {
      data: {
        header: item.key,
        texts: [{ text: item.help, classes: ['pre-wrap'] }]
      }
    });
  }
}

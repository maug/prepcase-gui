import { Component, EventEmitter, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ToolParameter } from '../types/ToolsParameters'
import { FormItemBase } from '../dynamic-form/FormItemBase'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { DynamicFormService } from '../dynamic-form/dynamic-form.service'
import { HelpDialogComponent } from '../help-dialog/help-dialog.component'

interface DialogData {
  header: string
  scriptParams: ToolParameter[]
  customEmitter?: EventEmitter<string[] | false>
}

interface ExecutingOptions {
  isEnabled: boolean
  showSpinner?: boolean
  message?: string
}

@Component({
  selector: 'app-script-parameters-dialog',
  templateUrl: './script-parameters-dialog.component.html',
  styleUrls: ['./script-parameters-dialog.component.scss'],
})
export class ScriptParametersDialogComponent implements OnInit {
  mainForm: UntypedFormGroup
  dynamicInputs: FormItemBase<any>[] = []
  executingOptions: ExecutingOptions = {
    isEnabled: false,
    showSpinner: true,
    message: 'Executing script...',
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private selfRef: MatDialogRef<ScriptParametersDialogComponent>,
    private dialog: MatDialog,
    private dynamicFormService: DynamicFormService,
    private formBuilder: UntypedFormBuilder
  ) {}
  ngOnInit() {
    this.mainForm = this.formBuilder.group({}, {})
    this.dynamicInputs = this.dynamicFormService.createInputs(this.data.scriptParams, [], this.mainForm)
  }

  setExecutingOptions(options: ExecutingOptions) {
    this.executingOptions = { ...this.executingOptions, ...options }
    if (this.executingOptions.isEnabled) {
      this.mainForm.disable()
    } else {
      this.mainForm.enable()
    }
  }

  onRun() {
    const params = this.dynamicFormService.readInputs(this.data.scriptParams, this.mainForm)
    if (this.data.customEmitter) {
      this.data.customEmitter.emit(params)
    } else {
      this.selfRef.close(params)
    }
  }

  onCancel() {
    if (this.data.customEmitter) {
      this.data.customEmitter.emit(false)
    } else {
      this.selfRef.close(false)
    }
  }

  openHelp(item: FormItemBase<any>) {
    this.dialog.open(HelpDialogComponent, {
      data: {
        header: item.key,
        texts: [{ text: item.help, classes: ['pre-wrap'] }],
      },
    })
  }
}

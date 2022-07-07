import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

interface Text {
  text: string
  keepHtml?: boolean
  classes?: string | string[]
}

export type DialogTexts = string | Array<Text | string>

type DialogTextsInternal = Required<Text>[]

interface Button {
  id: string
  label: string
}

interface DialogData {
  header: string
  texts: DialogTexts
  buttons?: Button[]
}

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss'],
})
export class HelpDialogComponent implements OnInit {
  header: string
  texts: DialogTextsInternal
  buttons: Button[]

  constructor(@Inject(MAT_DIALOG_DATA) data: DialogData) {
    this.header = data.header
    this.texts = []
    this.buttons = data.buttons || []
    if (typeof data.texts === 'string') {
      this.texts.push({ text: data.texts, keepHtml: false, classes: '' })
    } else {
      for (const stringOrText of data.texts) {
        if (typeof stringOrText === 'string') {
          this.texts.push({ text: stringOrText, keepHtml: false, classes: '' })
        } else {
          this.texts.push(Object.assign({ classes: '', keepHtml: false }, stringOrText))
        }
      }
    }
  }

  ngOnInit() {}
}

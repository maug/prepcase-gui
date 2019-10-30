import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

type Texts = Array<{
  text: string;
  keepHtml: boolean;
}>;

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent implements OnInit {
  header: string;
  texts: Texts = [];

  constructor(@Inject(MAT_DIALOG_DATA) data: { header: string, texts: string | string[] | Texts }) {
    this.header = data.header;
    if (typeof data.texts === 'string') {
      this.texts.push({ text: data.texts, keepHtml: false });
    } else {
      for (const stringOrText of data.texts) {
        if (typeof stringOrText === 'string') {
          this.texts.push({ text: stringOrText, keepHtml: false });
        } else {
          this.texts.push(stringOrText);
        }
      }
    }
  }

  ngOnInit() {
  }

}

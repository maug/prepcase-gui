import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormItemBase } from '../FormItemBase';

@Component({
  selector: 'app-dynamic-form-item',
  templateUrl: './dynamic-form-item.component.html',
  styleUrls: ['./dynamic-form-item.component.scss']
})
export class DynamicFormItemComponent implements OnInit {
  @Input() item: FormItemBase<any>;
  @Input() form: FormGroup;
  @Input() onHelp: (item: FormItemBase<any>) => void;
  get isValid() { return this.form.controls[this.item.key].valid; }

  constructor() { }

  ngOnInit() {
  }

}

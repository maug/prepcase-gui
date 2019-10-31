import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Output() displayHelp = new EventEmitter<FormItemBase<any>>();

  constructor() { }

  ngOnInit() {
  }

}

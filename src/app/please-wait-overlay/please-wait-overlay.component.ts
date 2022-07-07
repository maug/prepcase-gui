import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'app-please-wait-overlay',
  templateUrl: './please-wait-overlay.component.html',
  styleUrls: ['./please-wait-overlay.component.scss'],
})
export class PleaseWaitOverlayComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) data: any) {}

  ngOnInit() {}
}

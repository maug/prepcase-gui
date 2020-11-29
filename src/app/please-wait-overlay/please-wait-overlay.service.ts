import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PleaseWaitOverlayComponent } from './please-wait-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class PleaseWaitOverlayService {

  private dialogRef: MatDialogRef<PleaseWaitOverlayComponent> = null;

  constructor(
    private dialog: MatDialog,
  ) { }

  show() {
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(PleaseWaitOverlayComponent, {
        disableClose: true,
        data: {
        }
      });
    }
  }

  hide() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

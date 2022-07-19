import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'

import { UserService } from '../user.service'
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component'
import { HelpDialogComponent } from '../help-dialog/help-dialog.component'
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service'
import { ScriptsService } from './scripts.service'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { RpcExecuteCommandResponse } from '../types/RpcResponses'

@Component({
  selector: 'app-scripts',
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.scss'],
})
export class ScriptsComponent implements OnInit {
  public userScripts
  public selectedScript

  constructor(
    private router: Router,
    private userService: UserService,
    public dialog: MatDialog,
    private pleaseWaitService: PleaseWaitOverlayService,
    private scriptsService: ScriptsService
  ) {}

  ngOnInit(): void {
    this.userScripts = this.userService.userConfig.user_scripts
  }

  confirmDialog(script): void {
    const message = `Run this script?`

    const dialogData = new ConfirmDialogModel(script, message)

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: '300px',
      data: dialogData,
    })

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.processCommand(this.selectedScript, this.scriptsService.run(this.selectedScript))
      }
    })
  }

  // todo: extract this method as component and refactor uses
  private processCommand(name: string, cmd$: Observable<RpcExecuteCommandResponse>) {
    this.pleaseWaitService.show()
    cmd$.subscribe((data) => {
      const texts = [
        { text: 'COMMAND', classes: 'h1' },
        { text: data.command, classes: 'pre-wrap monospace' },
      ]
      if (data.return_code !== 0) {
        texts.push({ text: 'RETURN CODE: ' + data.return_code, classes: 'h1 error' })
      }
      if (data.stderr) {
        texts.push({ text: 'STDERR', classes: 'h1 error' })
        texts.push({ text: data.stderr, classes: 'pre-wrap monospace error' })
      }
      if (data.stdout) {
        texts.push({ text: 'STDOUT', classes: 'h1' })
        texts.push({ text: data.stdout, classes: 'pre-wrap monospace' })
      }
      this.pleaseWaitService.hide()
      this.dialog.open(HelpDialogComponent, {
        data: {
          header: name,
          texts,
        },
      })
    })
  }
}

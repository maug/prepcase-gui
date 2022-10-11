import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { SuiteProcessDetails } from '../../types/suites'
import { SuiteService } from '../suite.service'

interface DialogData {
  suiteRoot: string
  process: SuiteProcessDetails
}

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
})
export class ProcessComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private selfRef: MatDialogRef<ProcessComponent>,
    private dataService: SuiteService
  ) {}

  process: SuiteProcessDetails = null
  scriptOutput: string = ''
  isPollingOutput = true
  private timerRef = null

  ngOnInit() {
    this.getOutput(true)
  }

  onCancel() {
    window.clearTimeout(this.timerRef)
    this.timerRef = null
    this.selfRef.close(false)
  }

  getOutput(isFirstCall: boolean) {
    this.timerRef = window.setTimeout(
      () => {
        const linesLoaded = this.scriptOutput.split('\n').length - 1
        this.dataService
          .getProcessDetails(this.data.suiteRoot, this.data.process.pid, linesLoaded, 10)
          .subscribe((res) => {
            console.log('process details', res)
            this.scriptOutput += res.output_lines + '\n'
            if (res.status === 'COMPLETE') {
              this.isPollingOutput = false
            } else {
              if (this.timerRef) {
                this.getOutput(false)
              }
            }
          })
      },
      isFirstCall ? 0 : 1000
    )
  }
}

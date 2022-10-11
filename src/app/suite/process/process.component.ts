import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { SuiteProcessDetails } from '../../types/suites'
import { SuiteService } from '../suite.service'
import { formatISO9075 } from 'date-fns'

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

  columnsToDisplay = ['start_time', 'script_path', 'status', 'exit_code', 'pid']
  process: SuiteProcessDetails = this.data.process
  outputLines: string[] = []
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
        this.dataService
          .getProcessDetails(this.data.suiteRoot, this.data.process.pid, this.outputLines.length, 100000)
          .subscribe((res) => {
            console.log('process details', res)
            this.process = res
            this.outputLines.push(...res.output_lines)
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

  formatStartTime(time: number): string {
    return formatISO9075(time * 1000)
  }
}

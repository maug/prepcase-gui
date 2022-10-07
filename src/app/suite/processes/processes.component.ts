import { Component, Input, OnInit } from '@angular/core'
import { SuiteService } from '../suite.service'
import { SuiteProcessDetails } from '../../types/suites'
import { formatISO9075 } from 'date-fns'
import { SubmitWithCylcDialogComponent } from '../../submit-with-cylc-dialog/submit-with-cylc-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { ProcessComponent } from '../process/process.component'

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss'],
})
export class ProcessesComponent implements OnInit {
  @Input() suiteRoot: string

  isLoaded = false
  processes: SuiteProcessDetails[] = []
  columnsToDisplay = ['start_time', 'script_path', 'status', 'exit_code', 'pid', 'show_details']

  constructor(private dataService: SuiteService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataService.listProcesses(this.suiteRoot).subscribe((res) => {
      console.log('processesData', res)
      this.processes = res
      this.isLoaded = true
    })
  }

  async showDetails(process: SuiteProcessDetails) {
    const dialogRef = this.dialog.open(ProcessComponent, {
      disableClose: true,
      minWidth: 1000,
      data: {
        suiteRoot: this.suiteRoot,
        process,
      },
    })
    dialogRef.afterClosed().subscribe((result: { suitePath: string; suiteContents: string } | false) => {
      console.log('show details dialog closed', result)
    })
  }

  formatStartTime(time: number): string {
    return formatISO9075(time * 1000)
  }
}

// PROCESS STATE CODES
// Here are the different values that the s, stat and state output specifiers (header "STAT" or "S")
// will display to describe the state of a process:
//
// D    uninterruptible sleep (usually IO)
// I    Idle kernel thread
// R    running or runnable (on run queue)
// S    interruptible sleep (waiting for an event to complete)
// T    stopped by job control signal
// t    stopped by debugger during the tracing
// W    paging (not valid since the 2.6.xx kernel)
// X    dead (should never be seen)
// Z    defunct ("zombie") process, terminated but not reaped by its parent

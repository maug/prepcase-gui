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

  scriptOutput: string = ''

  ngOnInit() {
    this.dataService.getProcessDetails(this.data.suiteRoot, this.data.process.pid).subscribe((res) => {
      console.log('process details', res)
      this.scriptOutput = res.output_lines
    })
  }

  onCancel() {
    this.selfRef.close(false)
  }
}

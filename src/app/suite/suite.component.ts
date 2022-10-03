import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { SuiteService } from './suite.service'
import { SuiteConfiguration, SuiteScriptConfiguration } from '../types/suites'
import { ScriptParametersDialogComponent } from '../script-parameters-dialog/script-parameters-dialog.component'
import { ToolParametersService } from '../tool-parameters.service'
import { MatDialog } from '@angular/material/dialog'

@Component({
  selector: 'app-suite',
  templateUrl: './suite.component.html',
  styleUrls: ['./suite.component.scss'],
})
export class SuiteComponent implements OnInit {
  isLoaded = false
  suiteRoot: string
  config: SuiteConfiguration

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: SuiteService,
    private toolParametersService: ToolParametersService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.suiteRoot = paramMap.get('suiteRoot')
      const suiteData = await this.dataService.getSuite(this.suiteRoot)
      console.log('suiteData', suiteData)
      this.config = suiteData.configuration
      this.isLoaded = true
    })
  }

  async runScript(script: SuiteScriptConfiguration) {
    const scriptParams = this.toolParametersService.convertEnvironmentParametersToToolParameters(
      script.environment_parameters
    )
    const dialogRef = this.dialog.open(ScriptParametersDialogComponent, {
      disableClose: true,
      minWidth: 600,
      data: {
        header: script.path,
        scriptParams,
      },
    })
    dialogRef.afterClosed().subscribe((result: string[] | false) => {
      if (result === false) {
        return
      }
      const params = result.map((str) => {
        const [name, ...value] = str.split(' ')
        return { name, value: value.join(' ') }
      })
      console.log('dialog closed', script, params)
      this.dataService.runScript(this.suiteRoot, script.path, params).subscribe((res) => {
        console.log('script run response', res)
        // mytodo: go to process details or display error
      })
    })
  }
}

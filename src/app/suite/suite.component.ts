import { Component, OnInit } from '@angular/core'
import { RpcExecuteCommandResponse } from '../types/RpcResponses'
import { HelpDialogComponent } from '../help-dialog/help-dialog.component'
import { ActivatedRoute } from '@angular/router'
import { SuiteService } from './suite.service'
import { SuiteConfiguration } from '../types/suites'

@Component({
  selector: 'app-suite',
  templateUrl: './suite.component.html',
  styleUrls: ['./suite.component.scss'],
})
export class SuiteComponent implements OnInit {
  isLoaded = false
  suiteRoot: string
  config: SuiteConfiguration

  constructor(private activatedRoute: ActivatedRoute, private dataService: SuiteService) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.suiteRoot = paramMap.get('suiteRoot')
      const suiteData = await this.dataService.getSuite(this.suiteRoot)
      console.log('suiteData', suiteData)
      this.config = suiteData.configuration
      this.isLoaded = true
    })
  }
}

import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'

import { UserService } from '../user.service'
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service'
import { SuitesService } from './suites.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-suites',
  templateUrl: './suites.component.html',
  styleUrls: ['./suites.component.scss'],
})
export class SuitesComponent implements OnInit {
  public isLoaded = false
  public userSuites: { [parentDir: string]: { fullPath: string; dirName: string }[] }

  constructor(
    private router: Router,
    private userService: UserService,
    public dialog: MatDialog,
    private pleaseWaitService: PleaseWaitOverlayService,
    private suitesService: SuitesService
  ) {}

  ngOnInit(): void {
    this.loadSuites()
  }

  private loadSuites() {
    this.isLoaded = false
    this.suitesService.getSuiteList().subscribe((data) => {
      this.userSuites = {}
      for (const [parent, dirs] of Object.entries(data)) {
        this.userSuites[parent] = dirs.map((dir) => ({
          fullPath: dir,
          dirName: dir.replace(/\/$/, '').split('/').slice(-1)[0],
        }))
      }
      this.isLoaded = true
    })
  }
}

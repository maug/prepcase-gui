import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { CopyCaseDialogComponent } from '../copy-case-dialog/copy-case-dialog.component';
import { CaseListService } from './case-list.service';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  public isLoaded = false;
  public userCases: { [parentDir: string]: { fullPath: string, dirName: string }[] };

  public newPath: string = '';
  newPathInputActive: boolean = false;

  constructor(
    private router: Router,
    private caseListService: CaseListService,
    private userService: UserService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadCases();
  }

  addNewPath() {
    this.newPath = this.newPath.trim();
    if (this.newPath !== '') {
      this.isLoaded = false;
      this.newPathInputActive = false;
      this.caseListService.addNewCasePath(this.newPath).subscribe(res => {
        this.userService.setCaseDirs(res.caseDirs);
        this.newPath = '';
        this.loadCases();
      });
    }
  }

  private loadCases() {
    this.isLoaded = false;
    this.caseListService.getCaseList().subscribe(data => {
      this.userCases = {};
      for (const [parent, dirs] of Object.entries(data)) {
        this.userCases[parent] = dirs
          .map(dir => ({
            fullPath: dir,
            dirName: dir.replace(/\/$/, '').split('/').slice(-1)[0],
          }));
      }
      this.isLoaded = true;
    });
  }

  openCloneDialog(data: { fullPath: string, dirName: string } ) {
    this.dialog.open(CopyCaseDialogComponent, { minWidth: 600, disableClose: true, data })
      .afterClosed()
      .subscribe(formData => {
        if (formData) {
          this.pleaseWaitService.show();
          this.caseListService.copyCase(formData.fullPath, formData.newPath)
            .subscribe(res => {
              this.pleaseWaitService.hide();
              if (res.return_code !== 0) {
                this.dialog.open(HelpDialogComponent, {
                  data: {
                    header: 'ERROR',
                    texts: [{ text: JSON.stringify(res.stderr, null, '\t'), classes: 'pre-wrap monospace error' }],
                  }
                });
              } else {
                if (res.stdout) {
                  this.router.navigate(['/case', res.stdout]);
                } else {
                  this.loadCases();
                }
              }
            });
        }
      });
  }
}

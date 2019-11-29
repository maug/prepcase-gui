import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

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
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.loadCases();
  }

  addNewPath() {
    this.newPath = this.newPath.trim();
    if (this.newPath !== '') {
      this.isLoaded = false;
      this.newPathInputActive = false;
      this.userService.addNewCasePath(this.newPath).subscribe(data => {
        this.newPath = '';
        this.loadCases();
      });
    }
  }

  private loadCases() {
    this.isLoaded = false;
    this.userService.getCaseList().subscribe(data => {
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

}

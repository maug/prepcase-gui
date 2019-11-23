import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  private isLoaded = false;
  private userCases: { [parentDir: string]: { fullPath: string, dirName: string }[] };

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
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

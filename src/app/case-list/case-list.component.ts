import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  private isLoaded = false;
  private userCases: { [parentDir: string]: string[] };

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.userService.getCaseList().subscribe(data => {
      this.userCases = data;
      this.isLoaded = true;
    });
  }

}
